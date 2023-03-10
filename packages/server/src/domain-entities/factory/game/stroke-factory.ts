import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode} from "../../game";
import StrokeModel from "../../../dal/sql/models/game/stroke-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import PathNodeFactory from "./path-node-factory";
import {StrokeDocument} from "../../../dal/mongodb/models/stroke";
import {Stroke} from "../../stroke";
import StrokeAuthorizationPolicy from "../../../security/policy/stroke-authorization-policy";


@injectable()
export default class StrokeFactory implements EntityFactory<Stroke, StrokeDocument, StrokeModel> {

    @inject(INJECTABLE_TYPES.PathNodeFactory)
    nodePathFactory: PathNodeFactory;

    build({_id, game, path, color, size, fill, strokeType}: {_id?: string, game: string, path: PathNode[], color: string, size: number, fill: boolean, strokeType: string}): Stroke {
        const stroke = new Stroke(new StrokeAuthorizationPolicy(), this);
        stroke._id = _id;
        stroke.game = game;
        stroke.path = path;
        stroke.color = color;
        stroke.size = size;
        stroke.fill = fill;
        stroke.strokeType = strokeType;
        return stroke;
    }

    fromMongodbDocument(doc: StrokeDocument): Stroke {
        return this.build({
            _id: doc._id && doc._id.toString(),
            game: doc.game && doc.game.toString(),
            path: doc.path.map(node => this.nodePathFactory.fromMongodbDocument(node)),
            color: doc.color,
            size: doc.size,
            fill: doc.fill,
            strokeType: doc.strokeType
        });
    }

    async fromSqlModel(model: StrokeModel): Promise<Stroke> {
        return this.build({
            _id: model._id,
            game: model.GameId,
            path: await Promise.all((await model.getPath()).map(node => this.nodePathFactory.fromSqlModel(node))),
            color: model.color,
            size: model.size,
            fill: model.fill,
            strokeType: model.strokeType
        });
    }

}