

import {DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import PlaceModel from "./place-model";
import CharacterModel from "./game/character-model";
import UserModel from "./user-model";
import StrokeModel from "./game/stroke-model";
import FogStrokeModel from "./game/fog-stroke-model";
import MessageModel from "./game/message-model";
import InGameModelModel from "./game/in-game-model-model";
import PermissionControlledModel, {configPermissionControlledModel} from "./permission-controlled-model";
import {FogStroke} from "../../../domain-entities/game";


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

    static attributes = Object.assign({}, defaultAttributes, {
        passwordHash: {
            type: DataTypes.STRING
        }
    });

    static connect() {
        GameModel.belongsTo(WorldModel, {as: 'world'});
        GameModel.belongsTo(PlaceModel, {as: 'map'});
        GameModel.hasMany(CharacterModel, {as: 'characters'});
        GameModel.belongsTo(UserModel, {as: 'host'});
        GameModel.hasMany(StrokeModel, {as: 'strokes'});
        GameModel.hasMany(FogStrokeModel, {as: 'fog'});
        GameModel.hasMany(MessageModel, {as: 'messages'});
        GameModel.hasMany(InGameModelModel, {as: 'models'});
        configPermissionControlledModel(GameModel);
    }
}