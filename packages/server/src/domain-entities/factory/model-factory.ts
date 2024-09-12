import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Model} from "../model.js";
import {INJECTABLE_TYPES} from "../../di/injectable-types.js";
import AclFactory from "./acl-factory.js";
import {ModelAuthorizationPolicy} from "../../security/policy/model-authorization-policy.js";
import ModelModel from "../../dal/sql/models/model-model.js";


@injectable()
export default class ModelFactory implements EntityFactory<Model, ModelModel> {

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
            _id?: string,
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

    async fromSqlModel(model: ModelModel): Promise<Model> {
        return this.build({
            _id: model._id,
            name: model.name,
            depth: model.depth,
            width: model.width,
            height: model.height,
            fileName: model.fileName,
            notes: model.notes,
            world: model.worldId,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
            fileId: model.fileId
        })
    }

}