import {inject, injectable} from "inversify";
import {ServerConfig} from "../../../domain-entities/server-config.js";
import ServerConfigModel from "../models/server-config-model.js";
import {ServerConfigRepository} from "../../repository/server-config-repository.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory.js";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository.js";
import UserModel from "../models/user-model.js";
import RegisterCodeModel from "../models/register-code-model.js";
import {v4} from "uuid";


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
            unlockCode: entity.unlockCode
        });
    }

    async updateAssociations(entity: ServerConfig, model: ServerConfigModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
        const adminUserModels = await UserModel.findAll({where: {_id: entity.adminUsers}});
        await model.setAdmins(adminUserModels);

        const codesToSet = [];

        const currentCodes = await model.getCodes();
        for(const currentCode of currentCodes) {
            let found = false;
            for(const newCode of entity.registerCodes) {
                if(currentCode.code === newCode) {
                    found = true;
                    codesToSet.push(currentCode);
                }
            }
            if(!found) {
                await currentCode.destroy();
            }
        }

        for(const newCode of entity.registerCodes) {
            let found = false;
            for(const currentCode of currentCodes) {
                if(currentCode.code === newCode) {
                    found = true;
                }
            }
            if(!found) {
                codesToSet.push(await RegisterCodeModel.create({
                    _id: v4(),
                    code: newCode
                }));
            }
        }

        await model.setCodes(codesToSet);
    }

    async findOne(): Promise<ServerConfig> {
        const model = await ServerConfigModel.findOne();
        if(model) {
            return this.entityFactory.fromSqlModel(model);
        }
    }

}