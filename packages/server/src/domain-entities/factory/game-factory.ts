import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Character, FogStroke, Game, InGameModel, Message, Stroke} from "../game";
import {
    GameDocument,
} from "../../dal/mongodb/models/game";
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
export default class GameFactory implements EntityFactory<Game, GameDocument, GameModel> {

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
            strokes,
            fog,
            messages,
            models,
            host,
            acl
        }: {
            _id: string,
            passwordHash: string,
            world: string,
            map: string,
            characters: Character[],
            strokes: Stroke[],
            fog: FogStroke[],
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
        game.strokes = strokes;
        game.fog = fog;
        game.messages = messages;
        game.models = models;
        game.host = host;
        game.acl = acl;
        return game;
    }

    fromMongodbDocument({
        _id,
        passwordHash,
        world,
        map,
        characters,
        strokes,
        fog,
        messages,
        models,
        host,
        acl
    }: GameDocument): Game {
        const game: Game = new Game(new GameAuthorizationPolicy(), this);
        game._id = _id && _id.toString();
        game.passwordHash = passwordHash;
        game.world = world && world.toString();
        game.map = map && map.toString();
        game.characters = characters.map(character => this.characterFactory.fromMongodbDocument(character))
        game.strokes = strokes.map(stroke => this.strokeFactory.fromMongodbDocument(stroke));
        game.fog = fog.map(stroke => this.fogStrokeFactory.fromMongodbDocument(stroke));
        game.messages = messages.map(message => this.messageFactory.fromMongodbDocument(message));
        game.models = models.map(model => this.inGameModelFactory.fromMongodbDocument(model));
        game.host = host && host.toString();
        game.acl = acl.map(entry => this.aclFactory.fromMongodbDocument(entry));
        return game;
    }

    async fromSqlModel(model: GameModel): Promise<Game> {
        return this.build({
            _id: model._id,
            passwordHash: model.passwordHash,
            world: model.worldId,
            map: model.mapId,
            characters: await Promise.all((await model.getCharacters()).map(entry => this.characterFactory.fromSqlModel(entry))),
            strokes: await Promise.all((await model.getStrokes()).map(entry => this.strokeFactory.fromSqlModel(entry))),
            fog: await Promise.all((await model.getFog()).map(entry => this.fogStrokeFactory.fromSqlModel(entry))),
            messages: await Promise.all((await model.getMessages()).map(entry => this.messageFactory.fromSqlModel(entry))),
            models: await Promise.all((await model.getModels()).map(entry => this.inGameModelFactory.fromSqlModel(entry))),
            host: model.hostId,
            acl: await Promise.all((await model.getAcl()).map(entry => this.aclFactory.fromSqlModel(entry))),
        });
    }

}