import {
	DataLoader as DataLoaderInt,
	DomainEntity,
	EntityAuthorizationPolicy,
	Repository, UnitOfWork,
} from "../types";
import DataLoader from "dataloader";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "./filter-condition";
import { SecurityContext } from "../security/security-context";
import { injectable } from "inversify";

@injectable()
export abstract class GraphqlDataloader<T extends DomainEntity> implements DataLoaderInt<T> {
	repository: Repository<T>;

	getDocument = async (id: string, unitOfWork: UnitOfWork): Promise<T> => {
		if (id) {
			return this.getDataLoader(unitOfWork).load(id);
		}
		return null;
	};

	getDocuments = async (ids: string[], unitOfWork: UnitOfWork): Promise<T[]> => {
		const results = await this.getDataLoader(unitOfWork).loadMany(ids);
		const goodResults: T[] = [];
		for (let result of results) {
			if (result instanceof Error) {
				throw result;
			}
			goodResults.push(result);
		}
		return goodResults;
	};

	getPermissionControlledDocument = async (context: SecurityContext, id: string, unitOfWork: UnitOfWork): Promise<T> => {
		const document = await this.getDocument(id, unitOfWork);
		if (await document.authorizationPolicy.canRead(context)) {
			return document;
		}
	};

	getPermissionControlledDocuments = async (
		context: SecurityContext,
		ids: string[],
		unitOfWork: UnitOfWork
	): Promise<T[]> => {
		const documents = await this.getDocuments(ids, unitOfWork);
		const readableDocuments = [];
		for (let document of documents) {
			if (await document.authorizationPolicy.canRead(context)) {
				readableDocuments.push(document);
			}
		}
		return readableDocuments;
	};

	private getDataLoader = (unitOfWork: UnitOfWork) => {
		return new DataLoader((ids: string[]) =>
			this.getRepository(unitOfWork).find([new FilterCondition("_id", ids, FILTER_CONDITION_OPERATOR_IN)])
		);
	};

	abstract getRepository(unitOfWork: UnitOfWork): Repository<T>;
}
