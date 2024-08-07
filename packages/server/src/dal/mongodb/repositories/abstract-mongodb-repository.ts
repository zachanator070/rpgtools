import {DomainEntity, EntityFactory, MongoDBDocument} from "../../../types";
import {
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";
import mongoose from "mongoose";
import { PaginatedResult } from "../../paginated-result";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import FilterFactory from "../FilterFactory";
import {Repository} from "../../repository/repository";
import {DatabaseSession} from "../../database-session";

@injectable()
export abstract class AbstractMongodbRepository<
	EntityType extends DomainEntity,
	DocumentType extends MongoDBDocument
> implements Repository<EntityType>
{
	PAGE_LIMIT = 10;

	abstract model: mongoose.Model<any>;

	@inject(INJECTABLE_TYPES.FilterFactory)
	filterFactory: FilterFactory;

	abstract entityFactory: EntityFactory<EntityType, DocumentType, any>;

	setDatabaseSession(session: DatabaseSession) {
	}

	create = async (entity: EntityType): Promise<void> => {
		delete entity._id;
		this.hydrateEmbeddedIds(entity);
		const result = await this.model.create(entity);
		Object.assign(entity, this.entityFactory.fromMongodbDocument(result));
	};

	delete = async (entity: EntityType): Promise<void> => {
		await this.model.findByIdAndDelete(entity._id);
	};

	find = async (conditions: FilterCondition[], sort?: string): Promise<EntityType[]> => {
		const filter = this.filterFactory.build(conditions);
		const sortOptions: any = {};
		if (sort) {
			sortOptions[sort] = 1;
		}
		const docs: DocumentType[] = await this.model.find(filter, null, {sort: sortOptions}).exec();
		const results: EntityType[] = [];
		for (let doc of docs) {
			results.push(this.entityFactory.fromMongodbDocument(doc));
		}
		return results;
	};

	findOne = async (conditions: FilterCondition[] = []): Promise<EntityType> => {
		const results = await this.find(conditions);
		if (results.length >= 1) {
			return results[0];
		}
		return null;
	};

	findOneById(id: string): Promise<EntityType> {
		return this.findOne([new FilterCondition("_id", id)]);
	}

	findByIds(ids: string[]): Promise<EntityType[]> {
		return this.find([new FilterCondition("_id", ids, FILTER_CONDITION_OPERATOR_IN)]);
	}

	update = async (entity: EntityType): Promise<void> => {
		this.hydrateEmbeddedIds(entity);
		// construct document and hydrate to handle converting from a different document model
		const document = this.model.hydrate({_id: entity._id});
		// copy over all other attributes besides the id because the id is a string and not an ObjectID
		const clone = {...entity};
		delete clone._id;
		Object.assign(document, clone);
		await document.save();
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
		const filter = this.filterFactory.build(conditions);
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
			results.push(this.entityFactory.fromMongodbDocument(doc));
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

	// TODO: Should this be moved elsewhere? Maybe in the factory classes?
	hydrateEmbeddedIds(entity: EntityType) {}

	findAll(): Promise<EntityType[]> {
		return this.find([]);
	}
}
