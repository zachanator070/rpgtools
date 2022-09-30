import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Role} from "../role";
import {RoleDocument} from "../../dal/mongodb/models/role";
import {RoleAuthorizationPolicy} from "../../security/policy/role-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import {RoleModel} from "../../dal/sql/models/role-model";


@injectable()
export default class RoleFactory implements EntityFactory<Role, RoleDocument, RoleModel> {


    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            acl
        }: {
            _id: string,
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

    fromMongodbDocument({
        _id,
        name,
        world,
        acl
    }: RoleDocument): Role {
        const role = new Role(new RoleAuthorizationPolicy(), this);
        role._id = _id && _id.toString();
        role.name = name;
        role.world = world && world.toString();
        role.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
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