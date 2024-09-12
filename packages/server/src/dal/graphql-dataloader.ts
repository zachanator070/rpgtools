import {
	DataLoader as DataLoaderInt,
	DomainEntity
} from "../types";
import DataLoader from "dataloader";
import { SecurityContext } from "../security/security-context.js";
import { injectable } from "inversify";
import {Repository} from "./repository/repository.js";
import {DatabaseContext} from "./database-context.js";

@injectable()
export abstract class GraphqlDataloader<T extends DomainEntity> implements DataLoaderInt<T> {
	repository: Repository<T>;

	getDocument = async (id: string, databaseContext: DatabaseContext): Promise<T> => {
		if (id) {
			return this.getDataLoader(databaseContext).load(id);
		}
		return null;
	};

	getDocuments = async (ids: string[], databaseContext: DatabaseContext): Promise<T[]> => {
		const results = await this.getDataLoader(databaseContext).loadMany(ids);
		const goodResults: T[] = [];
		for (const result of results) {
			if (result instanceof Error) {
				throw result;
			}
			goodResults.push(result);
		}
		return goodResults;
	};

	getPermissionControlledDocument = async (context: SecurityContext, id: string, databaseContext: DatabaseContext): Promise<T> => {
		const document = await this.getDocument(id, databaseContext);
		if (await document.authorizationPolicy.canRead(context, databaseContext)) {
			return document;
		}
	};

	getPermissionControlledDocuments = async (
		context: SecurityContext,
		ids: string[],
		databaseContext: DatabaseContext
	): Promise<T[]> => {
		const documents = await this.getDocuments(ids, databaseContext);
		const readableDocuments = [];
		for (const document of documents) {
			if (await document.authorizationPolicy.canRead(context, databaseContext)) {
				readableDocuments.push(document);
			}
		}
		return readableDocuments;
	};

	private getDataLoader = (databaseContext: DatabaseContext) => {
		return new DataLoader((ids: string[]) =>
			this.getRepository(databaseContext).findByIds(ids)
		);
	};

	abstract getRepository(databaseContext: DatabaseContext): Repository<T>;
}
