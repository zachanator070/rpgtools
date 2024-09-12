import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Role} from "../role.js";
import {RoleAuthorizationPolicy} from "../../security/policy/role-authorization-policy.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import {RoleModel} from "../../dal/sql/models/role-model.js";


@injectable()
export default class RoleFactory implements EntityFactory<Role, RoleModel> {


    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            acl
        }: {
            _id?: string,
            name: string,
            world: string,
            acl: AclEntry[]
        }
    ) {
        const role: Role = new Role(new RoleAuthorizationPolicy(), this);
        role._id = _id;
        role.name = name;
        role.world = world;
        role.acl = acl;
        return role;
    }

    async fromSqlModel(model: RoleModel): Promise<Role> {
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
        });
    }
}