import { DomainEntity, DomainEntityFactory, DatabaseEntity, Repository } from "../../../types";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";
import { Model, LeanDocument, Document } from "mongoose";

export abstract class AbstractMongodbRepository<
	EntityType extends DomainEntity,
	DocumentType extends DatabaseEntity
> implements Repository<EntityType> {
	abstract model: Model<any>;
	abstract buildEntity(document: DocumentType): EntityType;

	create = async (entity: EntityType): Promise<void> => {
		const result = await this.model.create(entity);
		entity._id = result._id.toString();
	};

	delete = async (entity: EntityType): Promise<void> => {
		await this.model.findByIdAndDelete(entity._id);
	};

	find = async (conditions: FilterCondition[]): Promise<EntityType[]> => {
		const filter: any = {};
		for (let condition of conditions) {
			if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
				filter[condition.field] = { $in: condition.value };
			} else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
				filter[condition.field] = condition.value;
			} else {
				throw new Error(`Unsupported filter operator: ${condition.operator}`);
			}
		}
		const docs: DocumentType[] = await this.model.find(filter).lean().exec();
		const results: EntityType[] = [];
		for (let doc of docs) {
			results.push(this.buildEntity(doc));
		}
		return results;
	};

	findOne = async (conditions: FilterCondition[]): Promise<EntityType> => {
		const results = await this.find(conditions);
		if (results.length > 1) {
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
}
