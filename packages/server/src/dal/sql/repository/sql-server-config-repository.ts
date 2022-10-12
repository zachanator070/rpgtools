import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {ServerConfig} from "../../../domain-entities/server-config";
import ServerConfigModel from "../models/server-config-model";
import {ServerConfigRepository} from "../../repository/server-config-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory";


@injectable()
export default class SqlServerConfigRepository extends AbstractSqlRepository<ServerConfig, ServerConfigModel> implements ServerConfigRepository {

    staticModel = ServerConfigModel;

    @inject(INJECTABLE_TYPES.ServerConfigFactory)
    entityFactory: ServerConfigFactory;

    async modelFactory(entity: ServerConfig | undefined): Promise<ServerConfigModel> {
        return ServerConfigModel.build({
            _id: entity._id,
            version: entity.version,
            registerCodes: entity.registerCodes,
            unlockCode: entity.unlockCode
        });
    }

    async findOne(): Promise<ServerConfig> {
        return this.entityFactory.fromSqlModel(await ServerConfigModel.findOne());
    }

}