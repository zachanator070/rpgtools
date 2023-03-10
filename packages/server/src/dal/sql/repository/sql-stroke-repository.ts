import AbstractSqlRepository from "./abstract-sql-repository";
import {Stroke} from "../../../domain-entities/stroke";
import StrokeModel from "../models/game/stroke-model";
import StrokeRepository from "../../repository/stroke-repository";
import StrokeFactory from "../../../domain-entities/factory/game/stroke-factory";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {ModelStatic} from "sequelize";
import PathNodeModel from "../models/game/path-node-model";
import {v4} from "uuid";
import {PaginatedResult} from "../../paginated-result";

@injectable()
export default class SqlStrokeRepository extends AbstractSqlRepository<Stroke, StrokeModel> implements StrokeRepository {

    @inject(INJECTABLE_TYPES.StrokeFactory)
    entityFactory: StrokeFactory;

    staticModel: ModelStatic<any> = StrokeModel;

    async modelFactory(entity: Stroke): Promise<StrokeModel> {

        const pathNodeModels = [];
        for(let pathNode of entity.path) {
            const nodeModel = PathNodeModel.build({
                _id: pathNode._id,
                x: pathNode.x,
                y: pathNode.y,
                type: pathNode.type
            });
            if(!pathNode._id) {
                nodeModel._id = v4();
                await nodeModel.save();
                pathNode._id = nodeModel._id;
            }
            pathNodeModels.push(pathNode);
        }

        return StrokeModel.build({
            _id: entity._id,
            GameId: entity.game,
            color: entity.color,
            size: entity.size,
            fill: entity.fill,
            path: pathNodeModels,
            strokeType: entity.strokeType
        })
    }

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>> {
        return this.buildPaginatedResult(page, {GameId: id});
    }

    async deleteAllByGameId(id: string): Promise<void> {
        await this.staticModel.destroy({where: {GameId: id}});
    }

}