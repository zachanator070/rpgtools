import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Model} from "../model";
import {ModelDocument} from "../../dal/mongodb/models/model";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import {ModelAuthorizationPolicy} from "../../security/policy/model-authorization-policy";


@injectable()
export default class ModelFactory implements EntityFactory<Model, ModelDocument> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

    build(
        {
            _id,
            world,
            name,
            depth,
            width,
            height,
            fileName,
            fileId,
            notes,
            acl
        }:{
            _id: string,
            world: string,
            name: string,
            depth: number,
            width: number,
            height: number,
            fileName: string,
            fileId: string,
            notes: string,
            acl: AclEntry[]
        }
    ) {
        const model: Model = new Model(new ModelAuthorizationPolicy(), this);
        model._id = _id;
        model.world = world;
        model.name = name;
        model.depth = depth;
        model.width = width;
        model.height = height;
        model.fileName = fileName;
        model.fileId = fileId;
        model.notes = notes;
        model.acl = acl;
        return model;
    }

    fromMongodbDocument({
        _id,
        world,
        name,
        depth,
        width,
        height,
        fileName,
        fileId,
        notes,
        acl
    }: ModelDocument): Model {
        const model = new Model(new ModelAuthorizationPolicy(), this);
        model._id = _id && _id.toString();
        model.world = world && world.toString();
        model.name = name;
        model.depth = depth;
        model.width = width;
        model.height = height;
        model.fileName = fileName;
        model.fileId = fileId && fileId.toString();
        model.notes = notes;
        model.acl = this.aclFactory.fromMongodbDocument(acl);
        return model;
    }

}