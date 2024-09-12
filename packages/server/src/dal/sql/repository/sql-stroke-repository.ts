import AbstractSqlRepository from "./abstract-sql-repository.js";
import {Stroke} from "../../../domain-entities/stroke.js";
import StrokeModel from "../models/game/stroke-model.js";
import StrokeRepository from "../../repository/stroke-repository.js";
import StrokeFactory from "../../../domain-entities/factory/game/stroke-factory.js";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import {ModelStatic} from "sequelize";
import PathNodeModel from "../models/game/path-node-model.js";
import {v4} from "uuid";
import {PaginatedResult} from "../../paginated-result.js";

@injectable()
export default class SqlStrokeRepository extends AbstractSqlRepository<Stroke, StrokeModel> implements StrokeRepository {

    @inject(INJECTABLE_TYPES.StrokeFactory)
    entityFactory: StrokeFactory;

    staticModel: ModelStatic<any> = StrokeModel;

    async modelFactory(entity: Stroke): Promise<StrokeModel> {

        return StrokeModel.build({
            _id: entity._id,
            GameId: entity.game,
            color: entity.color,
            size: entity.size,
            fill: entity.fill,
            strokeType: entity.strokeType
        })
    }

    async updateAssociations(entity: Stroke, model: StrokeModel): Promise<void> {
        super.updateAssociations(entity, model);

        for(const pathNode of entity.path) {
            const nodeModel = PathNodeModel.build({
                _id: pathNode._id,
                x: pathNode.x,
                y: pathNode.y,
                type: pathNode.type,
                StrokeId: model._id,
            });
            if(!pathNode._id) {
                nodeModel._id = v4();
                await nodeModel.save();
                pathNode._id = nodeModel._id;
            }
            await nodeModel.save();
        }
    }

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>> {
        return this.buildPaginatedResult(page, {GameId: id});
    }

    async deleteAllByGameId(id: string): Promise<void> {
        await this.staticModel.destroy({where: {GameId: id}});
    }

}