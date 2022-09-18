import {
	DataLoader as DataLoaderInt,
	DomainEntity,
	UnitOfWork,
} from "../types";
import DataLoader from "dataloader";
import { SecurityContext } from "../security/security-context";
import { injectable } from "inversify";
import {Repository} from "./repository/repository";

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
		if (await document.authorizationPolicy.canRead(context, unitOfWork)) {
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
			if (await document.authorizationPolicy.canRead(context, unitOfWork)) {
				readableDocuments.push(document);
			}
		}
		return readableDocuments;
	};

	private getDataLoader = (unitOfWork: UnitOfWork) => {
		return new DataLoader((ids: string[]) =>
			this.getRepository(unitOfWork).findByIds(ids)
		);
	};

	abstract getRepository(unitOfWork: UnitOfWork): Repository<T>;
}
