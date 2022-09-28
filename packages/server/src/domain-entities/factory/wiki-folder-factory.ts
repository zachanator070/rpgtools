import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {WikiFolder} from "../wiki-folder";
import {WikiFolderDocument} from "../../dal/mongodb/models/wiki-folder";
import {WikiFolderAuthorizationPolicy} from "../../security/policy/wiki-folder-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";


@injectable()
export default class WikiFolderFactory implements EntityFactory<WikiFolder, WikiFolderDocument> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            name,
            world,
            pages,
            children,
            acl
        }:{
            _id: string,
            name: string,
            world: string,
            pages: string[],
            children: string[],
            acl: AclEntry[]
        }
    ) {
        const folder: WikiFolder = new WikiFolder(new WikiFolderAuthorizationPolicy(), this);
        folder._id = _id;
        folder.name = name;
        folder.world = world;
        folder.pages = pages;
        folder.children = children;
        folder.acl = acl;
        return folder;
    }

    fromMongodbDocument({
        _id,
        name,
        world,
        pages,
        children,
        acl
    }: WikiFolderDocument): WikiFolder {
        const folder = new WikiFolder(new WikiFolderAuthorizationPolicy(), this);
        folder._id = _id && _id.toString();
        folder.name = name;
        folder.world = world && world.toString();
        folder.pages = pages.map(page => page.toString());
        folder.children = children.map(child => child.toString());
        folder.acl = this.aclFactory.fromMongodbDocument(acl);
        return folder;
    }

}