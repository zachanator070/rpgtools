import { DomainEntity} from "../../../types";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";
import { PaginatedResult } from "../../paginated-result";
import {injectable} from "inversify";
import { v4 as uuidv4 } from 'uuid';
import {Repository} from "../../repository/repository";

@injectable()
export abstract class AbstractInMemoryRepository<Type extends DomainEntity>
	implements Repository<Type>
{
	items = new Map<string, Type>();

	PAGE_LIMIT = 100;

	create = async (entity: Type): Promise<void> => {
		if (!entity._id) {
			entity._id = uuidv4();
		}
		this.items.set(entity._id, entity);
	};

	delete = async (entity: Type): Promise<void> => {
		if (!this.items.get(entity._id)) {
			throw new Error(`Entity with id doesn't exists: ${entity._id}`);
		}
		this.items.delete(entity._id);
	};

	find = async (conditions: FilterCondition[], sort?: string): Promise<Type[]> => {
		let results: Type[] = Array.from(this.items.values());
		if (sort) {
			results = results.sort((a: any, b: any) => a[sort].compare(b[sort]));
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
		results = results.slice(startIndex, startIndex + 100 + 1);
		const totalPages = Math.ceil(count / this.PAGE_LIMIT);
		const prevPage = page - 1 >= 1 ? page - 1 : 1;
		const nextPage = page + 1 <= totalPages ? page + 1 : totalPages;
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

	private filter = (conditions: FilterCondition[], resultsArray: Type[]): Type[] => {
		let results = [...resultsArray];
		for (let filter of conditions) {
			results = results.filter((entity: any) => {
				if (filter.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
					return entity[filter.field] === filter.value;
				} else if (filter.operator === FILTER_CONDITION_OPERATOR_IN) {
					return entity[filter.field].includes(filter.value);
				}
				return false;
			});
		}
		return results;
	};
}
