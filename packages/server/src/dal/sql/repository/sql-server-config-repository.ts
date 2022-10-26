import {inject, injectable} from "inversify";
import {ServerConfig} from "../../../domain-entities/server-config";
import ServerConfigModel from "../models/server-config-model";
import {ServerConfigRepository} from "../../repository/server-config-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory";
import AbstractSqlRepository from "./abstract-sql-repository";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";


@injectable()
export default class SqlServerConfigRepository extends AbstractSqlRepository<ServerConfig, ServerConfigModel> implements ServerConfigRepository {

    staticModel = ServerConfigModel;

    @inject(INJECTABLE_TYPES.ServerConfigFactory)
    entityFactory: ServerConfigFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async modelFactory(entity: ServerConfig | undefined): Promise<ServerConfigModel> {
        return ServerConfigModel.build({
            _id: entity._id,
            version: entity.version,
            registerCodes: entity.registerCodes.join(','),
            unlockCode: entity.unlockCode
        });
    }

    async updateAssociations(entity: ServerConfig, model: ServerConfigModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
    }

    async findOne(): Promise<ServerConfig> {
        const model = await ServerConfigModel.findOne();
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}