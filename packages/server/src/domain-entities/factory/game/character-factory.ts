import {inject, injectable} from "inversify";
import {EntityFactory} from "../../../types";
import {Character, CharacterAttribute} from "../../game";
import {CharacterDocument} from "../../../dal/mongodb/models/game";
import CharacterModel from "../../../dal/sql/models/game/character-model";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import CharacterAttributeFactory from "./character-attribute-factory";


@injectable()
export default class CharacterFactory implements EntityFactory<Character, CharacterDocument, CharacterModel> {

    @inject(INJECTABLE_TYPES.CharacterAttributeFactory)
    characterAttributeFactory: CharacterAttributeFactory

    build(args: {
        _id: string,
        name: string,
        playerId: string,
        color: string,
        attributes: CharacterAttribute[]
    }): Character {
        return new Character(args._id, args.name, args.playerId, args.color, args.attributes);
    }

    fromMongodbDocument(doc: CharacterDocument): Character {
        return this.build({
            _id: doc._id && doc._id.toString(),
            name: doc.name,
            playerId: doc.player && doc.player.toString(),
            color: doc.color,
            attributes: doc.attributes.map(attribute => this.characterAttributeFactory.fromMongodbDocument(attribute))
        });
    }

    async fromSqlModel(model: CharacterModel): Promise<Character> {
        return this.build({
            _id: model._id,
            name: model.name,
            playerId: model.playerId,
            color: model.color,
            attributes: await Promise.all((await model.getAttributes()).map(attribute => this.characterAttributeFactory.fromSqlModel(attribute)))
        });
    }

}