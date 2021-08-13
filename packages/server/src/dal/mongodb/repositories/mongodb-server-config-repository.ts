import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { ServerConfig } from "../../../domain-entities/server-config";
import { inject, injectable } from "inversify";
import { ServerConfigDocument, ServerConfigFactory, ServerConfigRepository } from "../../../types";
import { Model } from "mongoose";
import { ServerConfigModel } from "../models/server-config";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbServerConfigRepository
	extends AbstractMongodbRepository<ServerConfig, ServerConfigDocument>
	implements ServerConfigRepository
{
	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	model: Model<any> = ServerConfigModel;

	buildEntity(document: ServerConfigDocument): ServerConfig {
		return this.serverConfigFactory(
			document._id.toString(),
			document.version,
			document.registerCodes,
			document.adminUsers.map((id) => id.toString()),
			document.unlockCode
		);
	}
}
