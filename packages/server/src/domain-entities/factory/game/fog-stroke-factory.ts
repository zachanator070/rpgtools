import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {FogStroke, PathNode} from "../../game";
import {FogStrokeDocument} from "../../../dal/mongodb/models/game";
import FogStrokeModel from "../../../dal/sql/models/game/fog-stroke-model";
import PathNodeFactory from "./path-node-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";


@injectable()
export default class FogStrokeFactory implements EntityFactory<FogStroke, FogStrokeDocument, FogStrokeModel> {

    @inject(INJECTABLE_TYPES.PathNodeFactory)
    nodePathFactory: PathNodeFactory;

    build(args: {_id?: string, path: PathNode[], size: number, type: string}): FogStroke {
        return new FogStroke(args._id, args.path, args.size, args.type);
    }

    fromMongodbDocument(doc: FogStrokeDocument): FogStroke {
        return this.build({
            _id: doc._id && doc._id.toString(),
            path: doc.path.map(node => this.nodePathFactory.fromMongodbDocument(node)),
            size: doc.size,
            type: doc.type
        });
    }

    async fromSqlModel(model: FogStrokeModel): Promise<FogStroke> {
        return this.build({
            _id: model._id,
            path: await Promise.all((await model.getPath()).map(node => this.nodePathFactory.fromSqlModel(node))),
            size: model.size,
            type: model.type
        });
    }

}