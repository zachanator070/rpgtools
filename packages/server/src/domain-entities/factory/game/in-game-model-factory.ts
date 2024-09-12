import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import InGameModelModel from "../../../dal/sql/models/game/in-game-model-model.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import ModelFactory from "../model-factory.js";
import {InGameModel} from "../../game.js";


@injectable()
export default class InGameModelFactory implements EntityFactory<InGameModel, InGameModelModel> {

    @inject(INJECTABLE_TYPES.ModelFactory)
    modelFactory: ModelFactory;

    build(args: {
        _id?: string,
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