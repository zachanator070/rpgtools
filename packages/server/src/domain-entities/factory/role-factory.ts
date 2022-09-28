import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Role} from "../role";
import {RoleDocument} from "../../dal/mongodb/models/role";
import {RoleAuthorizationPolicy} from "../../security/policy/role-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";


@injectable()
export default class RoleFactory implements EntityFactory<Role, RoleDocument> {

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
        role.acl = this.aclFactory.fromMongodbDocument(acl);
        return role;
    }

}