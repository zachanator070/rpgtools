import {injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode} from "../../game";
import PathNodeModel from "../../../dal/sql/models/game/path-node-model";


@injectable()
export default class PathNodeFactory implements EntityFactory<PathNode, PathNodeModel> {

    build({_id, x, y}: {_id?: string, x: number, y: number}): PathNode {
        return new PathNode(_id, x, y);
    }

    async fromSqlModel(model: PathNodeModel): Promise<PathNode> {
        return this.build({_id: model._id, x: model.x, y: model.y});
    }

}