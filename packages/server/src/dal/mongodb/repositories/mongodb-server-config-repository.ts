import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { ServerConfig } from "../../../domain-entities/server-config";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {ServerConfigDocument, ServerConfigModel} from "../models/server-config";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ServerConfigRepository} from "../../repository/server-config-repository";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory";

@injectable()
export class MongodbServerConfigRepository
	extends AbstractMongodbRepository<ServerConfig, ServerConfigDocument>
	implements ServerConfigRepository
{
	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	entityFactory: ServerConfigFactory;

	model: mongoose.Model<any> = ServerConfigModel;

}
