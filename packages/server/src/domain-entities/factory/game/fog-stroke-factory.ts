import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode} from "../../game.js";
import FogStrokeModel from "../../../dal/sql/models/game/fog-stroke-model.js";
import PathNodeFactory from "./path-node-factory.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import {FogStroke} from "../../fog-stroke.js";
import FogStrokeAuthorization from "../../../security/policy/fog-stroke-authorization-policy.js";


@injectable()
export default class FogStrokeFactory implements EntityFactory<FogStroke, FogStrokeModel> {

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