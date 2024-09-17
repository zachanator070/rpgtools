import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import {defaultAttributes} from "./default-attributes.js";
import WorldModel from "./world-model.js";
import PlaceModel from "./place-model.js";
import CharacterModel from "./game/character-model.js";
import UserModel from "./user-model.js";
import StrokeModel from "./game/stroke-model.js";
import FogStrokeModel from "./game/fog-stroke-model.js";
import MessageModel from "./game/message-model.js";
import InGameModelModel from "./game/in-game-model-model.js";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model.js";
import {PLACE, USER, WORLD} from "@rpgtools/common/src/type-constants.js";

export default class GameModel extends PermissionControlledModel {

    declare passwordHash: string;
    declare worldId: string;
    declare mapId: string;
    declare hostId: string;

    getCharacters: HasManyGetAssociationsMixin<CharacterModel>;
    setCharacters: HasManySetAssociationsMixin<CharacterModel, string>;
    getStrokes: HasManyGetAssociationsMixin<StrokeModel>;
    setStrokes: HasManySetAssociationsMixin<StrokeModel, string>;
    getFog: HasManyGetAssociationsMixin<FogStrokeModel>;
    setFog: HasManySetAssociationsMixin<FogStrokeModel, string>;
    getMessages: HasManyGetAssociationsMixin<MessageModel>;
    setMessages: HasManySetAssociationsMixin<MessageModel, string>;
    getModels: HasManyGetAssociationsMixin<InGameModelModel>;
    setModels: HasManySetAssociationsMixin<InGameModelModel, string>;

    static attributes = {
        ...defaultAttributes,
        passwordHash: {
            type: DataTypes.STRING
        },
        worldId: {
            type: DataTypes.UUID,
            references: {
                model: WORLD,
                key: '_id'
            }
        },
        mapId: {
            type: DataTypes.UUID,
            references: {
                model: PLACE,
                key: '_id'
            }
        },
        hostId: {
            type: DataTypes.UUID,
            references: {
                model: USER,
                key: '_id'
            }
        }
    };

    static connect() {
        GameModel.belongsTo(WorldModel, {as: 'world'});
        GameModel.belongsTo(PlaceModel, {as: 'map'});
        GameModel.belongsTo(UserModel, {as: 'host'});
        GameModel.hasMany(CharacterModel, {as: 'characters', onDelete: 'CASCADE'});
        GameModel.hasMany(StrokeModel, {as: 'strokes', onDelete: 'CASCADE'});
        GameModel.hasMany(FogStrokeModel, {as: 'fog', onDelete: 'CASCADE'});
        GameModel.hasMany(MessageModel, {as: 'messages', onDelete: 'CASCADE'});
        GameModel.hasMany(InGameModelModel, {as: 'models', onDelete: 'CASCADE'});
        configPermissionControlledModel(GameModel);
    }
}