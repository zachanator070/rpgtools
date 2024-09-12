import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {Character, CharacterAttribute} from "../../game.js";
import CharacterModel from "../../../dal/sql/models/game/character-model.js";
import {INJECTABLE_TYPES} from "../../../di/injectable-types.js";
import CharacterAttributeFactory from "./character-attribute-factory.js";


@injectable()
export default class CharacterFactory implements EntityFactory<Character, CharacterModel> {

    @inject(INJECTABLE_TYPES.CharacterAttributeFactory)
    characterAttributeFactory: CharacterAttributeFactory

    build(args: {
        _id?: string,
        name: string,
        playerId: string,
        color: string,
        attributes: CharacterAttribute[]
    }): Character {
        return new Character(args._id, args.name, args.playerId, args.color, args.attributes);
    }

    async fromSqlModel(model: CharacterModel): Promise<Character> {
        return this.build({
            _id: model._id,
            name: model.name,
            playerId: model.playerId,
            color: model.color,
            attributes: await Promise.all((await model.getCharacterAttributes()).map(attribute => this.characterAttributeFactory.fromSqlModel(attribute)))
        });
    }

}