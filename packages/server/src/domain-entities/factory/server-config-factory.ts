import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {ServerConfig} from "../server-config.js";
import {ServerConfigAuthorizationPolicy} from "../../security/policy/server-config-authorization-policy.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import ServerConfigModel from "../../dal/sql/models/server-config-model.js";

@injectable()
export default class ServerConfigFactory implements EntityFactory<ServerConfig, ServerConfigModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            version,
            registerCodes,
            adminUsers,
            unlockCode,
            acl,
            defaultWorld
        }: {
            _id?: string,
            version: string,
            registerCodes: string[],
            adminUsers: string[],
            unlockCode: string,
            acl: AclEntry[],
            defaultWorld: string
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

    async fromSqlModel(model: ServerConfigModel): Promise<ServerConfig> {
        const registerCodes = await model.getCodes();
        return this.build({
            _id: model._id,
            version: model.version,
            registerCodes: registerCodes.map(code => code.code),
            adminUsers: (await model.getAdmins()).map(user => user._id),
            unlockCode: model.unlockCode,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
            defaultWorld: model.defaultWorldId
        });
    }

}