import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {InGameModelDocument} from "../../../dal/mongodb/models/game";
import InGameModelModel from "../../../dal/sql/models/game/in-game-model-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import ModelFactory from "../model-factory";
import {InGameModel} from "../../game";


@injectable()
export default class InGameModelFactory implements EntityFactory<InGameModel, InGameModelDocument, InGameModelModel> {

    @inject(INJECTABLE_TYPES.ModelFactory)
    modelFactory: ModelFactory;

    build(args: {
        _id: string,
        modelId: string,
        x: number,
        z: number,
        lookAtX: number,
        lookAtZ: number,
        color: string,
        wikiId: string
    }): InGameModel {
        return new InGameModel(args._id, args.modelId, args.x, args.z, args.lookAtX, args. lookAtZ, args.color, args.wikiId);
    }

    fromMongodbDocument(doc: InGameModelDocument): InGameModel {
        return this.build({
            _id: doc._id && doc._id.toString(),
            modelId: doc.model && doc.model.toString(),
            x: doc.x,
            z: doc.z,
            lookAtX: doc.lookAtX,
            lookAtZ: doc.lookAtZ,
            color: doc.color,
            wikiId: doc.wiki && doc.wiki.toString()
        });
    }

    async fromSqlModel(model: InGameModelModel): Promise<InGameModel> {
        return this.build({
            _id: model._id,
            modelId: model.modelId,
            x: model.x,
            z: model.z,
            lookAtX: model.lookAtX,
            lookAtZ: model.lookAtZ,
            color: model.color,
            wikiId: model.wikiId
        });
    }
}