import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {World} from "../world";
import {WorldDocument} from "../../dal/mongodb/models/world";
import {ObjectId} from "mongoose";
import {WorldAuthorizationPolicy} from "../../security/policy/world-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";


@injectable()
export default class WorldFactory implements EntityFactory<World, WorldDocument> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            wikiPage,
            rootFolder,
            acl
        }:{
            _id: string,
            name: string,
            wikiPage: string,
            rootFolder: string,
            acl: AclEntry[]
        }
    ) {
        const world: World = new World(new WorldAuthorizationPolicy(), this);
        world._id = _id;
        world.name = name;
        world.wikiPage = wikiPage;
        world.rootFolder = rootFolder;
        world.acl = acl;
        return world;
    }

    fromMongodbDocument({
        _id,
        name,
        wikiPage,
        rootFolder,
        acl
    }: WorldDocument): World {
        const world = new World(new WorldAuthorizationPolicy(), this);
        world._id = _id && _id.toString();
        world.name = name;
        world.wikiPage = wikiPage && wikiPage.toString();
        world.rootFolder = rootFolder && rootFolder.toString();
        world.acl = this.aclFactory.fromMongodbDocument(acl);
        return world;
    }

}