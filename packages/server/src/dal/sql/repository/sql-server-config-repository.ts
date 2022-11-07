import {inject, injectable} from "inversify";
import {ServerConfig} from "../../../domain-entities/server-config";
import ServerConfigModel from "../models/server-config-model";
import {ServerConfigRepository} from "../../repository/server-config-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ServerConfigFactory from "../../../domain-entities/factory/server-config-factory";
import AbstractSqlRepository from "./abstract-sql-repository";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";
import UserModel from "../models/user-model";
import RegisterCodeModel from "../models/register-code-model";


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
        for(let currentCode of currentCodes) {
            let found = false;
            for(let newCode of entity.registerCodes) {
                if(currentCode.code === newCode) {
                    found = true;
                    codesToSet.push(currentCode);
                }
            }
            if(!found) {
                await currentCode.destroy();
            }
        }

        for(let newCode of entity.registerCodes) {
            let found = false;
            for(let currentCode of currentCodes) {
                if(currentCode.code === newCode) {
                    found = true;
                }
            }
            if(!found) {
                codesToSet.push(await RegisterCodeModel.create({
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