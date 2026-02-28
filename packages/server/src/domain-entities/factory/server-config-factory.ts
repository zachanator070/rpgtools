import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types.js";
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
            adminUsers,
            acl,
            defaultWorld
        }: {
            _id?: string,
            version: string,
            adminUsers: string[],
            acl: AclEntry[],
            defaultWorld: string
        }
    ) {
        const serverConfig: ServerConfig = new ServerConfig(new ServerConfigAuthorizationPolicy(), this);
        serverConfig._id = _id;
        serverConfig.version = version;
        serverConfig.adminUsers = adminUsers.map(user => user.toString());
        serverConfig.acl = acl;
        serverConfig.defaultWorld = defaultWorld;
        return serverConfig;
    }

    async fromSqlModel(model: ServerConfigModel): Promise<ServerConfig> {
        return this.build({
            _id: model._id,
            version: model.version,
            adminUsers: (await model.getAdmins()).map(user => user._id),
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
            defaultWorld: model.defaultWorldId
        });
    }

}