import { DomainEntity, Repository } from "../../../types";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";

export abstract class AbstractInMemoryRepository<Type extends DomainEntity>
	implements Repository<Type> {
	items = new Map<string, Type>();

	create = async (entity: Type): Promise<void> => {
		if (this.items.get(entity._id)) {
			throw new Error(`Entity with id already exists: ${entity._id}`);
		}
		this.items.set(entity._id, entity);
	};

	delete = async (entity: Type): Promise<void> => {
		if (!this.items.get(entity._id)) {
			throw new Error(`Entity with id already exists: ${entity._id}`);
		}
		this.items.delete(entity._id);
	};

	find = async (conditions: FilterCondition[]): Promise<Type[]> => {
		let results: Type[] = Array.from(this.items.values());
		for (let filter of conditions) {
			results = results.filter((entity: any) => {
				if (filter.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
					return entity[filter.field] === filter.value;
				} else if (filter.operator === FILTER_CONDITION_OPERATOR_IN) {
					return filter.value.includes(entity[filter.field]);
				}
			});
		}
		return results;
	};

	findById = async (id: string): Promise<Type> => {
		return this.items.get(id) ?? null;
	};

	findOne = async (conditions: FilterCondition[]): Promise<Type> => {
		const results = await this.find(conditions);

		if (results.length !== 1) {
			return null;
		}
		return results[0];
	};

	update = async (entity: Type): Promise<void> => {
		await this.delete(entity);
		await this.create(entity);
	};
}
