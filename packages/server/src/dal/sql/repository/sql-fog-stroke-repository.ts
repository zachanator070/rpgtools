import AbstractSqlRepository from "./abstract-sql-repository";
import {FogStroke} from "../../../domain-entities/fog-stroke";
import FogStrokeModel from "../models/game/fog-stroke-model";
import FogStrokeFactory from "../../../domain-entities/factory/game/fog-stroke-factory";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {ModelStatic} from "sequelize";
import FogStrokeRepository from "../../repository/fog-stroke-repository";
import PathNodeModel from "../models/game/path-node-model";
import {v4} from "uuid";
import {PaginatedResult} from "../../paginated-result";

@injectable()
export default class SqlFogStrokeRepository extends AbstractSqlRepository<FogStroke, FogStrokeModel> implements FogStrokeRepository{

    @inject(INJECTABLE_TYPES.FogStrokeFactory)
    entityFactory: FogStrokeFactory;

    async modelFactory(entity: FogStroke): Promise<FogStrokeModel> {

        return FogStrokeModel.build({
            _id: entity._id,
            GameId: entity.game,
            size: entity.size,
            strokeType: entity.strokeType,
        });
    }

    async updateAssociations(entity: FogStroke, model: FogStrokeModel): Promise<void> {
        super.updateAssociations(entity, model);

        for(let pathNode of entity.path) {
            const nodeModel = PathNodeModel.build({
                _id: pathNode._id,
                x: pathNode.x,
                y: pathNode.y,
                type: pathNode.type,
                FogStrokeId: model._id,
            });
            if(!pathNode._id) {
                nodeModel._id = v4();
                await nodeModel.save();
                pathNode._id = nodeModel._id;
            }
            await nodeModel.save();
        }

    }

    staticModel: ModelStatic<any> = FogStrokeModel;

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>> {
        return this.buildPaginatedResult(page, {GameId: id});
    }

    async deleteAllByGameId(id: string): Promise<void> {
        await this.staticModel.destroy({where: {GameId: id}});
    }

}