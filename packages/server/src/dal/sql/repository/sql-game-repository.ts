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

    async updateAssociations(entity: Game, gameModel: GameModel) {
        await this.sqlPermissionControlledRepository.updateAssociations(entity, gameModel);

        await this.updateCharacters(entity, gameModel);
        await this.updateMessages(entity, gameModel);
        await this.updateStrokes(entity, gameModel);
        await this.updateFog(entity, gameModel);
        await this.updateInGameModels(entity, gameModel);
    }

    async updateCharacters(entity: Game, gameModel: GameModel) {
        const characterModels = [];
        for(let character of entity.characters) {

            const characterModel = CharacterModel.build({
                _id: character._id,
                name: character.name,
                color: character.color,
                playerId: character.player,
                GameId: entity._id
            });
            if(!character._id) {
                await characterModel.save();
                character._id = characterModel._id;
            }
            characterModels.push(characterModel);

            // save new attributes
            const attributeModels = [];
            for(let attribute of character.attributes) {
                const attributeModel = CharacterAttributeModel.build({
                    _id: attribute._id,
                    name: attribute.name,
                    value: attribute.value
                });
                if (!attribute._id) {
                    await attributeModel.save();
                    attribute._id = attributeModel._id
                }
                attributeModels.push(attributeModel);
            }

            // delete old attributes
            for(let attributeModel of await CharacterAttributeModel.findAll({where: {CharacterId: character._id}})) {
                let keep = false;
                for(let characterAttributeModel of attributeModels) {
                    if(attributeModel._id === characterAttributeModel._id) {
                        keep = true;
                        break;
                    }
                }
                if(!keep) {
                    await attributeModel.destroy();
                }
            }
            await characterModel.setCharacterAttributes(attributeModels);
        }

        await gameModel.setCharacters(characterModels);
    }

    async updateMessages(entity: Game, gameModel: GameModel) {
        const messageModels = [];

        // save new messages
        for(let message of entity.messages) {
            const messageModel = MessageModel.build({
                _id: message._id,
                message: message.message,
                timestamp: message.timestamp,
                sender: message.sender,
                senderUser: message.senderUser,
                receiver: message.receiver,
                receiverUser: message.receiverUser,
                GameId: entity._id
            });
            if (!message._id) {
                await messageModel.save();
                message._id = messageModel._id
            }
            messageModels.push(messageModel);
        }

        // delete old messages
        for(let messageModel of await MessageModel.findAll({where: {GameId: entity._id}})) {
            let keep = false;
            for(let oldMessageModel of messageModels) {
                if(messageModel._id === oldMessageModel._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                await messageModel.destroy();
            }
        }

        await gameModel.setMessages(messageModels);
    }

    async updateStrokes(entity: Game, gameModel: GameModel) {
        const strokeModels = [];

        for(let stroke of entity.strokes) {
            const pathNodeModels = [];
            for(let pathNode of stroke.path) {
                const nodeModel = PathNodeModel.build({
                    _id: pathNode._id,
                    x: pathNode.x,
                    y: pathNode.y,
                    type: pathNode.type
                });
                if(!pathNode._id) {
                    await nodeModel.save();
                    pathNode._id = nodeModel._id;
                }
                pathNodeModels.push(pathNode);
            }
            const strokeModel = StrokeModel.build({
                _id: stroke._id,
                color: stroke.color,
                size: stroke.size,
                fill: stroke.fill,
                type: stroke.type,
                GameId: entity._id,
                path: pathNodeModels
            });
            if (!stroke._id) {
                await strokeModel.save();
                stroke._id = strokeModel._id
            }
            strokeModels.push(strokeModel);
        }

        // delete old stokes
        for(let oldStroke of await StrokeModel.findAll({where: {GameId: entity._id}})) {
            let keep = false;
            for(let newStrokes of strokeModels) {
                if(oldStroke._id === newStrokes._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                // should cascade node deletion
                await oldStroke.destroy();
            }
        }
        await gameModel.setStrokes(strokeModels);
    }

    async updateFog(entity: Game, gameModel: GameModel) {
        const fogModels = [];

        for(let fog of entity.fog) {
            const pathNodeModels = [];
            for(let pathNode of fog.path) {
                const nodeModel = PathNodeModel.build({
                    _id: pathNode._id,
                    x: pathNode.x,
                    y: pathNode.y,
                    type: pathNode.type
                });
                if(!pathNode._id) {
                    await nodeModel.save();
                    pathNode._id = nodeModel._id;
                }
                pathNodeModels.push(pathNode);
            }
            const fogModel = FogStrokeModel.build({
                _id: fog._id,
                size: fog.size,
                type: fog.type,
                GameId: entity._id,
                path: pathNodeModels
            });
            if (!fog._id) {
                await fogModel.save();
                fog._id = fogModel._id
            }
            fogModels.push(fogModel);
        }

        // delete old fog strokes
        for(let oldFog of await FogStrokeModel.findAll({where: {GameId: entity._id}})) {
            let keep = false;
            for(let newFog of fogModels) {
                if(oldFog._id === newFog._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                // should cascade node deletion
                await oldFog.destroy();
            }
        }
        await gameModel.setFog(fogModels);
    }

    async updateInGameModels(entity: Game, gameModel: GameModel) {
        const inGameModelModels = [];

        // save new messages
        for(let inGameModel of entity.models) {
            const inGameModelModel = InGameModelModel.build({
                _id: inGameModel._id,
                x: inGameModel.x,
                z: inGameModel.z,
                lookAtX: inGameModel.lookAtX,
                lookAtZ: inGameModel.lookAtZ,
                color: inGameModel.color,
                modelId: inGameModel.model,
                wikiId: inGameModel.wiki,
                GameId: entity._id
            });
            if (!inGameModel._id) {
                await inGameModelModel.save();
                inGameModel._id = inGameModelModel._id
            }
            inGameModelModels.push(inGameModelModel);
        }

        // delete old models
        for(let oldInGameModel of await InGameModelModel.findAll({where: {GameId: entity._id}})) {
            let keep = false;
            for(let newInGameModel of inGameModelModels) {
                if(oldInGameModel._id === newInGameModel._id) {
                    keep = true;
                    break;
                }
            }
            if(!keep) {
                await oldInGameModel.destroy();
            }
        }

        await gameModel.setModels(inGameModelModels);

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