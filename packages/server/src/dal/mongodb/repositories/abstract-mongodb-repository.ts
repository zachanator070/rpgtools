import { DomainEntity, DatabaseEntity, Repository } from "../../../types";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FILTER_CONDITION_REGEX,
	FilterCondition,
} from "../../filter-condition";
import mongoose from "mongoose";
import { PaginatedResult } from "../../paginated-result";
import { injectable } from "inversify";

@injectable()
export abstract class AbstractMongodbRepository<
	EntityType extends DomainEntity,
	DocumentType extends DatabaseEntity
> implements Repository<EntityType>
{
	PAGE_LIMIT = 10;

	abstract model: mongoose.Model<any>;

	create = async (entity: EntityType): Promise<void> => {
		delete entity._id;
		const result = await this.model.create(entity);
		entity._id = result._id.toString();
	};

	delete = async (entity: EntityType): Promise<void> => {
		await this.model.findByIdAndDelete(entity._id);
	};

	find = async (conditions: FilterCondition[]): Promise<EntityType[]> => {
		const filter = this.getFilter(conditions);
		try {
			const docs: DocumentType[] = await this.model.find(filter).exec();
			const results: EntityType[] = [];
			for (let doc of docs) {
				results.push(this.buildEntity(doc));
			}
			return results;
		} catch (e) {
			console.error(e);
		}
	};

	findOne = async (conditions: FilterCondition[] = []): Promise<EntityType> => {
		const results = await this.find(conditions);
		if (results.length >= 1) {
			return results[0];
		}
		return null;
	};

	findById(id: string): Promise<EntityType> {
		return this.findOne([new FilterCondition("_id", id)]);
	}

	update = async (entity: EntityType): Promise<void> => {
		await this.model.updateOne({ _id: entity._id }, entity);
	};

	findPaginated = async (
		conditions: FilterCondition[],
		page: number,
		sort?: string
	): Promise<PaginatedResult<EntityType>> => {
		/** TODO: Reimplement pagination
		 * this method of pagination (also the one provided by mongoose-pagination-v2) is NOT scalable for large
		 * collections. See https://www.mongodb.com/blog/post/paging-with-the-bucket-pattern--part-1 This
		 * will require to change the page param to a nextId param. The PaginatedResult will have less info as a result.
		 */
		const filter = this.getFilter(conditions);
		const sortOptions: any = {};
		if (sort) {
			sortOptions[sort] = 1;
		}
		const docs: DocumentType[] = await this.model
			.find(filter, null, {sort: sortOptions})
			.skip((page - 1) * this.PAGE_LIMIT)
			.limit(this.PAGE_LIMIT)
			.exec();
		const results: EntityType[] = [];
		for (let doc of docs) {
			results.push(this.buildEntity(doc));
		}
		const count = await this.model.find(filter).count();
		const totalPages = Math.ceil(count / this.PAGE_LIMIT);
		const prevPage = page - 1 >= 1 ? page - 1 : 1;
		const nextPage = page + 1 <= totalPages ? page + 1 : null;
		return new PaginatedResult(
			results,
			count,
			this.PAGE_LIMIT,
			page,
			totalPages,
			page,
			page - 1 >= 1,
			page + 1 <= totalPages,
			prevPage,
			nextPage
		);
	};

	private getFilter = (conditions: FilterCondition[]) => {
		const filter: any = {};
		for (let condition of conditions) {
			if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
				filter[condition.field] = { $in: condition.value };
			} else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
				filter[condition.field] = condition.value;
			} else if (condition.operator === FILTER_CONDITION_REGEX) {
				filter[condition.field] = { $regex: condition.value, $options: "i" };
			} else {
				throw new Error(`Unsupported filter operator: ${condition.operator}`);
			}
		}
		return filter;
	};

	abstract buildEntity(document: DocumentType): EntityType;
}
