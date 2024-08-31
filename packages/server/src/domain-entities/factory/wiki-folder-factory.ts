import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {WikiFolder} from "../wiki-folder";
import {WikiFolderAuthorizationPolicy} from "../../security/policy/wiki-folder-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import WikiFolderModel from "../../dal/sql/models/wiki-folder-model";


@injectable()
export default class WikiFolderFactory implements EntityFactory<WikiFolder, WikiFolderModel> {

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
            _id?: string,
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

    async fromSqlModel(model: WikiFolderModel): Promise<WikiFolder> {
        return this.build({
            _id: model._id,
            name: model.name,
            world: model.worldId,
            pages: (await model.getPages()).map(page => page._id),
            children: (await model.getChildren()).map(child => child._id),
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
        });
    }

}