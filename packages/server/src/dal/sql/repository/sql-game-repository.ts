import {inject, injectable} from "inversify";
import AbstractSqlRepository from "./abstract-sql-repository";
import {Game} from "../../../domain-entities/game";
import GameModel from "../models/game-model";
import {GameRepository} from "../../repository/game-repository";
import GameFactory from "../../../domain-entities/factory/game-factory";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import CharacterModel from "../models/game/character-model";
import CharacterAttributeModel from "../models/game/character-attribute-model";
import MessageModel from "../models/game/message-model";
import StrokeModel from "../models/game/stroke-model";
import PathNodeModel from "../models/game/path-node-model";
import FogStrokeModel from "../models/game/fog-stroke-model";
import InGameModelModel from "../models/game/in-game-model-model";
import SqlPermissionControlledRepository from "./sql-permission-controlled-repository";


@injectable()
export default class SqlGameRepository extends AbstractSqlRepository<Game, GameModel> implements GameRepository {
    staticModel = GameModel;

    @inject(INJECTABLE_TYPES.GameFactory)
    entityFactory: GameFactory;

    @inject(INJECTABLE_TYPES.SqlPermissionControlledRepository)
    sqlPermissionControlledRepository: SqlPermissionControlledRepository;

    async modelFactory(entity: Game | undefined): Promise<GameModel> {
        return GameModel.build({
            _id: entity._id,
            passwordHash: entity.passwordHash,
            worldId: entity.world,
            mapId: entity.map,
            hostId: entity.host,
        });
    }

    async updateAssociations(entity: Game, model: GameModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, model);
        await model.setCharacters(await Promise.all(entity.characters.map(character => CharacterModel.create({
            _id: character._id,
            name: character.name,
            color: character.color,
            playerId: character.player,
            attributes: character.attributes.map(attribute => CharacterAttributeModel.create({
                _id: attribute._id,
                name: attribute.name,
                value: attribute.value
            })),
        }))));
        await model.setMessages(await Promise.all(entity.messages.map(message => MessageModel.create({
            _id: message._id,
            message: message.message,
            timestamp: message.timestamp,
            sender: message.sender,
            senderUser: message.senderUser,
            receiver: message.receiver,
            receiverUser: message.receiverUser
        }))));
        await model.setStrokes(await Promise.all(entity.strokes.map(async stroke => StrokeModel.create({
            _id: stroke._id,
            color: stroke.color,
            size: stroke.size,
            fill: stroke.fill,
            type: stroke.type,
            path: await Promise.all(stroke.path.map(pathNode => PathNodeModel.create({
                _id: pathNode._id,
                x: pathNode.x,
                y: pathNode.y,
                type: pathNode.type
            })))
        }))));
        await model.setFog(await Promise.all(entity.fog.map(async fog => FogStrokeModel.create({
            _id: fog._id,
            size: fog.size,
            type: fog.type,
            path: await Promise.all(fog.path.map(pathNode => PathNodeModel.build({
                _id: pathNode._id,
                x: pathNode.x,
                y: pathNode.y,
                type: pathNode.type
            })))
        }))));
        await model.setModels(await Promise.all(entity.models.map(inGameModel => InGameModelModel.create({
            _id: inGameModel._id,
            x: inGameModel.x,
            z: inGameModel.z,
            lookAtX: inGameModel.lookAtX,
            lookAtZ: inGameModel.lookAtZ,
            color: inGameModel.color,
            modelId: inGameModel.model,
            wikiId: inGameModel.wiki
        }))));
    }

    async findByPlayer(userId: string): Promise<Game[]> {
        const games = await GameModel.findAll({
            include: {
                association: 'characters',
                where: {
                    playerId: userId
                }
            }
        });
        return this.buildResults(games);
    }

    async findWithModel(modelId: string): Promise<Game[]> {
        const games = await GameModel.findAll({
            include: {
                association: 'models',
                where: {
                    modelId
                }
            }
        });
        return this.buildResults(games);
    }

}