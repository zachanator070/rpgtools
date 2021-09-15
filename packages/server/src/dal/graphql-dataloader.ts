import {
	DataLoader as DataLoaderInt,
	DomainEntity,
	EntityAuthorizationRuleset,
	Repository,
} from "../types";
import DataLoader from "dataloader";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "./filter-condition";
import { SecurityContext } from "../security-context";
import { injectable } from "inversify";

@injectable()
export abstract class GraphqlDataloader<T extends DomainEntity> implements DataLoaderInt<T> {
	repository: Repository<T>;
	ruleset: EntityAuthorizationRuleset<T, DomainEntity>;

	getDocument = async (id: string): Promise<T> => {
		return this.getDataLoader().load(id);
	};

	getDocuments = async (ids: string[]): Promise<T[]> => {
		const results = await this.getDataLoader().loadMany(ids);
		const goodResults: T[] = [];
		for (let result of results) {
			if (result instanceof Error) {
				throw result;
			}
			goodResults.push(result);
		}
		return goodResults;
	};

	getPermissionControlledDocument = async (context: SecurityContext, id: string): Promise<T> => {
		const document = await this.getDocument(id);
		if (await this.ruleset.canRead(context, document)) {
			return document;
		}
	};

	getPermissionControlledDocuments = async (
		context: SecurityContext,
		ids: string[]
	): Promise<T[]> => {
		const documents = await this.getDocuments(ids);
		const readableDocuments = [];
		for (let document of documents) {
			if (await this.ruleset.canRead(context, document)) {
				readableDocuments.push(document);
			}
		}
		return readableDocuments;
	};

	private getDataLoader = () => {
		return new DataLoader((ids: string[]) =>
			this.repository.find([new FilterCondition("_id", ids, FILTER_CONDITION_OPERATOR_IN)])
		);
	};
}