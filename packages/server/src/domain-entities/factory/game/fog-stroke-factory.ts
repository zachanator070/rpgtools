import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode} from "../../game";
import FogStrokeModel from "../../../dal/sql/models/game/fog-stroke-model";
import PathNodeFactory from "./path-node-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {FogStrokeDocument} from "../../../dal/mongodb/models/fog-stroke";
import {FogStroke} from "../../fog-stroke";
import FogStrokeAuthorization from "../../../security/policy/fog-stroke-authorization-policy";


@injectable()
export default class FogStrokeFactory implements EntityFactory<FogStroke, FogStrokeDocument, FogStrokeModel> {

    @inject(INJECTABLE_TYPES.PathNodeFactory)
    nodePathFactory: PathNodeFactory;

    build({_id, game, path, size, strokeType}: {_id?: string, game: string, path: PathNode[], size: number, strokeType: string}): FogStroke {
        const stroke = new FogStroke(new FogStrokeAuthorization(), this);
        stroke._id = _id;
        stroke.game = game;
        stroke.path = path;
        stroke.size = size;
        stroke.strokeType = strokeType;
        return stroke;
    }

    fromMongodbDocument(doc: FogStrokeDocument): FogStroke {
        return this.build({
            _id: doc._id && doc._id.toString(),
            game: doc.game && doc.game.toString(),
            path: doc.path.map(node => this.nodePathFactory.fromMongodbDocument(node)),
            size: doc.size,
            strokeType: doc.strokeType
        });
    }

    async fromSqlModel(model: FogStrokeModel): Promise<FogStroke> {
        return this.build({
            _id: model._id,
            game: model.GameId,
            path: await Promise.all((await model.getPath()).map(node => this.nodePathFactory.fromSqlModel(node))),
            size: model.size,
            strokeType: model.strokeType
        });
    }

}