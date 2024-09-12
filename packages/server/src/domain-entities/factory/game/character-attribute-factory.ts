import {injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {CharacterAttribute} from "../../game.js";
import CharacterAttributeModel from "../../../dal/sql/models/game/character-attribute-model.js";


@injectable()
export default class CharacterAttributeFactory implements EntityFactory<CharacterAttribute, CharacterAttributeModel> {
    build(args: {_id?: string, name: string, value: number}): CharacterAttribute {
        return new CharacterAttribute(args._id, args.name, args.value);
    }

    async fromSqlModel(model: CharacterAttributeModel): Promise<CharacterAttribute> {
        return this.build({
            _id: model._id,
            name: model.name,
            value: model.value
        });
    }

}