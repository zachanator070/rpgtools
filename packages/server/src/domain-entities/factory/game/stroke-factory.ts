import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {PathNode, Stroke} from "../../game";
import {StrokeDocument} from "../../../dal/mongodb/models/game";
import StrokeModel from "../../../dal/sql/models/game/stroke-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import PathNodeFactory from "./path-node-factory";


@injectable()
export default class StrokeFactory implements EntityFactory<Stroke, StrokeDocument, StrokeModel> {

    @inject(INJECTABLE_TYPES.PathNodeFactory)
    nodePathFactory: PathNodeFactory;

    build(args: {_id?: string, path: PathNode[], color: string, size: number, fill: boolean, type: string}): Stroke {
        return new Stroke(args._id, args.path, args.color, args.size, args.fill, args.type);
    }

    fromMongodbDocument(doc: StrokeDocument): Stroke {
        return this.build({
            _id: doc._id && doc._id.toString(),
            path: doc.path.map(node => this.nodePathFactory.fromMongodbDocument(node)),
            color: doc.color,
            size: doc.size,
            fill: doc.fill,
            type: doc.type
        });
    }

    async fromSqlModel(model: StrokeModel): Promise<Stroke> {
        return this.build({
            _id: model._id,
            path: await Promise.all((await model.getPath()).map(node => this.nodePathFactory.fromSqlModel(node))),
            color: model.color,
            size: model.size,
            fill: model.fill,
            type: model.type
        });
    }

}