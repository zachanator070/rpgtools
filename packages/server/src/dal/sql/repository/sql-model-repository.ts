import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository.js";
import ModelModel from "../models/model-model.js";
import {Model} from "../../../domain-entities/model.js";
import {ModelRepository} from "../../repository/model-repository.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import ModelFactory from "../../../domain-entities/factory/model-factory.js";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository.js";


@injectable()
export default class SqlModelRepository extends AbstractSqlRepository<Model, ModelModel> implements ModelRepository {

    staticModel = ModelModel;

    @inject(INJECTABLE_TYPES.ModelFactory)
    entityFactory: ModelFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

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

    async updateAssociations(entity: Model, model: ModelModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
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