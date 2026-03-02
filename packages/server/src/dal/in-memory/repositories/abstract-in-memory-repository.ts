import { DomainEntity} from "../../../types.js";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FILTER_CONDITION_REGEX,
	FilterCondition,
} from "../../filter-condition.js";
import {PaginatedResult} from "../../paginated-result.js";
import {injectable} from "inversify";
import {v4 as uuidv4} from 'uuid';
import {Repository} from "../../repository/repository.js";
import { GenericRpgToolsAPIError, RpgToolsAPIError } from "../../../errors.js";

@injectable()
export abstract class AbstractInMemoryRepository<Type extends DomainEntity>
	implements Repository<Type> {

	items = new Map<string, Type>();

	PAGE_LIMIT = 100;

	create = async (entity: Type): Promise<void> => {
		this.assignIds(entity as any, new WeakSet<object>(), false);
		if (!entity._id) {
			entity._id = uuidv4();
		}
		this.items.set(entity._id, entity);
	};

	delete = async (entity: Type): Promise<void> => {
		if (!this.items.get(entity._id)) {
			throw new GenericRpgToolsAPIError(`Entity with id doesn't exists: ${entity._id}`);
		}
		this.items.delete(entity._id);
	};

	find = async (conditions: FilterCondition[], sort?: string): Promise<Type[]> => {
		let results: Type[] = Array.from(this.items.values());
		if (sort) {
			results = results.sort((a: any, b: any) => {
				const left = a?.[sort];
				const right = b?.[sort];
				if (typeof left === 'string' && typeof right === 'string') {
					return left.localeCompare(right);
				}
				if (left == null && right == null) {
					return 0;
				}
				if (left == null) {
					return -1;
				}
				if (right == null) {
					return 1;
				}
				if (left === right) {
					return 0;
				}
				return left > right ? 1 : -1;
			});
		}
		results = this.filter(conditions, results);
		return results;
	};

	findAll() {
		return this.find([]);
	}

	findOneById = async (id: string): Promise<Type> => {
		return this.items.get(id) ?? null;
	};

	findByIds(ids: string[]): Promise<Type[]> {
		return this.find([new FilterCondition("_id", ids, FILTER_CONDITION_OPERATOR_IN)]);
	}

	findOne = async (conditions: FilterCondition[] = []): Promise<Type> => {
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

	findPaginated = async (
		conditions: FilterCondition[],
		page: number,
		sort?: string
	): Promise<PaginatedResult<Type>> => {
		let results = await this.find(conditions, sort);
		const count = results.length;
		const startIndex = (page - 1) * this.PAGE_LIMIT;
		results = results.slice(startIndex, startIndex + this.PAGE_LIMIT);
		const totalPages = Math.ceil(count / this.PAGE_LIMIT);
		const hasPrevPage = page - 1 >= 1;
		const hasNextPage = page + 1 <= totalPages;
		const prevPage = hasPrevPage ? page - 1 : null;
		const nextPage = hasNextPage ? page + 1 : null;
		return new PaginatedResult(
			results,
			count,
			this.PAGE_LIMIT,
			page,
			totalPages,
			startIndex + 1,
			hasPrevPage,
			hasNextPage,
			prevPage,
			nextPage
		);
	};

	private filter = (conditions: FilterCondition[], resultsArray: Type[]): Type[] => {
		let results = [...resultsArray];
		for (let filter of conditions) {
			results = results.filter((entity: any) => {
				const entityValue = entity[filter.field];
				if (filter.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
					return entityValue === filter.value;
				} else if (filter.operator === FILTER_CONDITION_OPERATOR_IN) {
					if (Array.isArray(filter.value)) {
						if (Array.isArray(entityValue)) {
							return entityValue.some((value) => filter.value.includes(value));
						}
						return filter.value.includes(entityValue);
					}
					if (Array.isArray(entityValue)) {
						return entityValue.includes(filter.value);
					}
					return false;
				} else if (filter.operator === FILTER_CONDITION_REGEX) {
					if (typeof entityValue !== 'string') {
						return false;
					}
					try {
						const regex = new RegExp(String(filter.value), 'i');
						return regex.test(entityValue);
					} catch {
						return entityValue.toLowerCase().includes(String(filter.value).toLowerCase());
					}
				}
				return false;
			});
		}
		return results;
	};

	private assignIds = (value: any, visited: WeakSet<object>, inArray: boolean): void => {
		if (!value || typeof value !== 'object') {
			return;
		}
		if (visited.has(value)) {
			return;
		}
		visited.add(value);
		if (value instanceof Date || Buffer.isBuffer(value)) {
			return;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				this.assignIds(item, visited, true);
			}
			return;
		}

		if (('_id' in value && !value._id) || (inArray && value.constructor === Object && !('_id' in value))) {
			value._id = uuidv4();
		}

		for (const key of Object.keys(value)) {
			this.assignIds(value[key], visited, false);
		}
	};
}
