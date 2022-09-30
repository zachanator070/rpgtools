import {injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode} from "../../game";
import {PathNodeDocument} from "../../../dal/mongodb/models/game";
import PathNodeModel from "../../../dal/sql/models/game/path-node-model";


@injectable()
export default class PathNodeFactory implements EntityFactory<PathNode, PathNodeDocument, PathNodeModel> {

    build({_id, x, y}: {_id: string, x: number, y: number}): PathNode {
        return new PathNode(_id, x, y);
    }

    fromMongodbDocument(document: PathNodeDocument): PathNode {
        return this.build({_id: document._id.toString(), x: document.x, y: document.y});
    }

    async fromSqlModel(model: PathNodeModel): Promise<PathNode> {
        return this.build({_id: model._id, x: model.x, y: model.y});
    }

}