import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { ServerConfig } from "../../../domain-entities/server-config";
import { inject, injectable } from "inversify";
import { ServerConfigFactory, ServerConfigRepository } from "../../../types";
import mongoose from "mongoose";
import {ServerConfigDocument, ServerConfigModel} from "../models/server-config";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

@injectable()
export class MongodbServerConfigRepository
	extends AbstractMongodbRepository<ServerConfig, ServerConfigDocument>
	implements ServerConfigRepository
{
	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	model: mongoose.Model<any> = ServerConfigModel;

	buildEntity(document: ServerConfigDocument): ServerConfig {
		return this.serverConfigFactory(
			{
				_id: document._id.toString(),
				version: document.version,
				registerCodes: document.registerCodes,
				adminUsers: document.adminUsers.map((id) => id.toString()),
				unlockCode: document.unlockCode,
				acl: AclFactory(document.acl)
			}
		);
	}
}
