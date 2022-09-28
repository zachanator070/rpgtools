import {inject, injectable} from "inversify";
import {AclEntry, EntityFactory} from "../../types";
import {Character, CharacterAttribute, FogStroke, Game, InGameModel, Message, PathNode, Stroke} from "../game";
import {
    CharacterAttributeDocument,
    CharacterDocument,
    FogStrokeDocument,
    GameDocument, InGameModelDocument, MessageDocument,
    PathNodeDocument,
    StrokeDocument
} from "../../dal/mongodb/models/game";
import {GameAuthorizationPolicy} from "../../security/policy/game-authorization-policy";
import {INJECTABLE_TYPES} from "../../di/injectable-types";
import AclFactory from "./acl-factory";


@injectable()
export default class GameFactory implements EntityFactory<Game, GameDocument> {

    @inject(INJECTABLE_TYPES.AclFactory)
    aclFactory: AclFactory

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
        game.characters = this.buildCharacters(characters);
        game.strokes = this.buildStrokes(strokes);
        game.fog = this.buildFogStrokes(fog);
        game.messages = this.buildMessages(messages);
        game.models = this.buildModels(models);
        game.host = host && host.toString();
        game.acl = this.aclFactory.fromMongodbDocument(acl);
        return game;
    }

    private buildNodePath(path: PathNodeDocument[]): PathNode[] {
        const nodes: PathNode[] = [];
        for (let document of path) {
            nodes.push(new PathNode(document._id.toString(), document.x, document.y));
        }
        return nodes;
    }

    private buildFogStrokes(fog: FogStrokeDocument[]): FogStroke[] {
        const strokes: FogStroke[] = [];
        for (let fogDocument of fog) {
            strokes.push(
                new FogStroke(
                    fogDocument._id.toString(),
                    this.buildNodePath(fogDocument.path),
                    fogDocument.size,
                    fogDocument.type
                )
            );
        }
        return strokes;
    }

    private buildStrokes(documents: StrokeDocument[]): Stroke[] {
        const strokes: Stroke[] = [];
        for (let document of documents) {
            strokes.push(
                new Stroke(
                    document._id.toString(),
                    this.buildNodePath(document.path),
                    document.color,
                    document.size,
                    document.fill,
                    document.type
                )
            );
        }
        return strokes;
    }

    private buildCharacters(documents: CharacterDocument[]): Character[] {
        const characters: Character[] = [];
        for (let document of documents) {
            characters.push(
                new Character(
                    document._id.toString(),
                    document.name,
                    document.player.toString(),
                    document.color,
                    this.buildCharacterAttributes(document.attributes)
                )
            );
        }
        return characters;
    }

    private buildCharacterAttributes(documents: CharacterAttributeDocument[]): CharacterAttribute[] {
        const attributes: CharacterAttribute[] = [];
        for (let document of documents) {
            attributes.push(
                new CharacterAttribute(
                    document._id.toString(),
                    document.name,
                    document.value,
                )
            );
        }
        return attributes;
    }

    private buildMessages(documents: MessageDocument[]): Message[] {
        const messages: Message[] = [];
        for (let document of documents) {
            messages.push(
                new Message(
                    document.sender,
                    document.senderUser,
                    document.receiver,
                    document.receiverUser,
                    document.message,
                    document.timestamp,
                    document._id.toString()
                )
            );
        }
        return messages;
    }

    private buildModels(documents: InGameModelDocument[]): InGameModel[] {
        const models: InGameModel[] = [];
        for (let document of documents) {
            models.push(
                new InGameModel(
                    document._id.toString(),
                    document.model.toString(),
                    document.x,
                    document.z,
                    document.lookAtX,
                    document.lookAtZ,
                    document.color,
                    document.wiki ? document.wiki.toString() : null
                )
            );
        }
        return models;
    }

}