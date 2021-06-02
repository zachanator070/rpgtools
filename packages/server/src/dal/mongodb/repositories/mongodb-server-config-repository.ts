import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { ServerConfig } from "../../../domain-entities/server-config";
import { injectable } from "inversify";
import { ServerConfigRepository } from "../../../types";
import { Model } from "mongoose";
import { ServerConfigDocument, ServerConfigModel } from "../models/server-config";

@injectable()
export class MongodbServerConfigRepository
	extends AbstractMongodbRepository<ServerConfig, ServerConfigDocument>
	implements ServerConfigRepository {
	model: Model<any> = ServerConfigModel;

	buildEntity(document: ServerConfigDocument): ServerConfig {
		return new ServerConfig(
			document._id.toString(),
			document.version,
			document.registerCodes,
			document.adminUsers.map((id) => id.toString()),
			document.unlockCode
		);
	}
}
