import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Character, Game, InGameModel, Message} from "../game";
import {GameAuthorizationPolicy} from "../../security/policy/game-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";
import GameModel from "../../dal/sql/models/game-model";
import CharacterFactory from "./game/character-factory";
import PathNodeFactory from "./game/path-node-factory";
import StrokeFactory from "./game/stroke-factory";
import MessageFactory from "./game/message-factory";
import InGameModelFactory from "./game/in-game-model-factory";
import FogStrokeFactory from "./game/fog-stroke-factory";


@injectable()
export default class GameFactory implements EntityFactory<Game, GameModel> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory;

    @inject(INJECTABLE_TYPES.CharacterFactory)
    characterFactory: CharacterFactory;

    @inject(INJECTABLE_TYPES.FogStrokeFactory)
    fogStrokeFactory: FogStrokeFactory;

    @inject(INJECTABLE_TYPES.InGameModelFactory)
    inGameModelFactory: InGameModelFactory;

    @inject(INJECTABLE_TYPES.MessageFactory)
    messageFactory: MessageFactory;

    @inject(INJECTABLE_TYPES.PathNodeFactory)
    pathNodeFactory: PathNodeFactory;

    @inject(INJECTABLE_TYPES.StrokeFactory)
    strokeFactory: StrokeFactory;

    build(
        {
            _id,
            passwordHash,
            world,
            map,
            characters,
            messages,
            models,
            host,
            acl
        }: {
            _id?: string,
            passwordHash: string,
            world: string,
            map: string,
            characters: Character[],
            messages: Message[],
            models: InGameModel[],
            host: string,
            acl: AclEntry[]
        }
    ) {
        const game: Game = new Game(new GameAuthorizationPolicy(), this);
        game._id = _id;
        game.passwordHash = passwordHash;
        game.world = world;
        game.map = map;
        game.characters = characters;
        game.messages = messages;
        game.models = models;
        game.host = host;
        game.acl = acl;
        return game;
    }

    async fromSqlModel(model: GameModel): Promise<Game> {
        return this.build({
            _id: model._id,
            passwordHash: model.passwordHash,
            world: model.worldId,
            map: model.mapId,
            characters: await Promise.all((await model.getCharacters()).map(entry => this.characterFactory.fromSqlModel(entry))),
            messages: await Promise.all((await model.getMessages()).map(entry => this.messageFactory.fromSqlModel(entry))),
            models: await Promise.all((await model.getModels()).map(entry => this.inGameModelFactory.fromSqlModel(entry))),
            host: model.hostId,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
        });
    }

}