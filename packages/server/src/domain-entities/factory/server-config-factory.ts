import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {ServerConfig} from "../server-config";
import {ServerConfigDocument} from "../../dal/mongodb/models/server-config";
import {ServerConfigAuthorizationPolicy} from "../../security/policy/server-config-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import ServerConfigModel from "../../dal/sql/models/server-config-model";

@injectable()
export default class ServerConfigFactory implements EntityFactory<ServerConfig, ServerConfigDocument, ServerConfigModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            version,
            registerCodes,
            adminUsers,
            unlockCode,
            acl
        }: {
            _id: string,
            version: string,
            registerCodes: string[],
            adminUsers: string[],
            unlockCode: string,
            acl: AclEntry[]
        }
    ) {
        const serverConfig: ServerConfig = new ServerConfig(new ServerConfigAuthorizationPolicy(), this);
        serverConfig._id = _id;
        serverConfig.version = version;
        serverConfig.registerCodes = registerCodes;
        serverConfig.adminUsers = adminUsers.map(user => user.toString());
        serverConfig.unlockCode = unlockCode;
        serverConfig.acl = acl;
        return serverConfig;
    }

    fromMongodbDocument({
        _id,
        version,
        registerCodes,
        adminUsers,
        unlockCode,
        acl
    }: ServerConfigDocument): ServerConfig {
        const serverConfig = new ServerConfig(new ServerConfigAuthorizationPolicy(), this);
        serverConfig._id = _id && _id.toString();
        serverConfig.version = version;
        serverConfig.registerCodes = registerCodes;
        serverConfig.adminUsers = adminUsers.map(user => user.toString());
        serverConfig.unlockCode = unlockCode;
        serverConfig.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
        return serverConfig;
    }

    async fromSqlModel(model: ServerConfigModel): Promise<ServerConfig> {
        return this.build({
            _id: model._id,
            version: model.version,
            registerCodes: model.registerCodes.split(','),
            adminUsers: (await model.getAdmins()).map(user => user._id),
            unlockCode: model.unlockCode,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
        });
    }

}