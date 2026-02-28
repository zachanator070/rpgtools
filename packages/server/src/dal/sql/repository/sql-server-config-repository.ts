import {inject, injectable} from "inversify";
import {ServerConfig} from "../../../domain-entities/server-config.js";
import ServerConfigModel from "../models/server-config-model.js";
import {ServerConfigRepository} from "../../repository/server-config-repository.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory.js";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository.js";
import UserModel from "../models/user-model.js";


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
            version: entity.version
        });
    }

    async updateAssociations(entity: ServerConfig, model: ServerConfigModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
        const adminUserModels = await UserModel.findAll({where: {_id: entity.adminUsers}});
        await model.setAdmins(adminUserModels);
    }

    async findOne(): Promise<ServerConfig> {
        const model = await ServerConfigModel.findOne();
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}