import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import ModelModel from "../models/model-model";
import {Model} from "../../../domain-entities/model";
import {ModelRepository} from "../../repository/model-repository";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ModelFactory from "../../../domain-entities/factory/model-factory";


@injectable()
export default class SqlModelRepository extends AbstractSqlRepository<Model, ModelModel> implements ModelRepository {

    staticModel = ModelModel;

    @inject(INJECTABLE_TYPES.ModelFactory)
    entityFactory: ModelFactory;

    async modelFactory(entity: Model | undefined): Promise<ModelModel> {
        return ModelModel.build({
            _id: entity._id,
            name: entity.name,
            depth: entity.depth,
            width: entity.width,
            height: entity.height,
            fileName: entity.fileName,
            notes: entity.notes,
            worldId: entity.world,
            fileId: entity.fileId
        });
    }

    async findByWorld(worldId: string): Promise<Model[]> {
        const foundModels = await ModelModel.findAll({
            where: {
                worldId: worldId
            }
        });
        return this.buildResults(foundModels);
    }

}