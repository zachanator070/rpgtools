

import {DataTypes, Model} from "sequelize";
import {defaultAttributes} from "./default-attributes";
import WorldModel from "./world-model";
import PlaceModel from "./place-model";
import CharacterModel from "./game/character-model";
import UserModel from "./user-model";
import StrokeModel from "./game/stroke-model";
import FogStrokeModel from "./game/fog-stroke-model";
import MessageModel from "./game/message-model";
import GameModelModel from "./game/game-model-model";
import configPermissionControlledModel from "./config-permission-controlled-model";


export default class GameModel extends Model {

    static attributes = Object.assign({}, defaultAttributes, {
        passwordHash: {
            type: DataTypes.STRING
        }
    });

    static connect() {
        GameModel.belongsTo(WorldModel, {foreignKey: 'world'});
        GameModel.belongsTo(PlaceModel, {foreignKey: 'map'});
        GameModel.hasMany(CharacterModel);
        GameModel.belongsTo(UserModel, {foreignKey: 'host'});
        GameModel.hasMany(StrokeModel);
        GameModel.hasMany(FogStrokeModel);
        GameModel.hasMany(MessageModel);
        GameModel.hasMany(GameModelModel);
        configPermissionControlledModel(GameModel);
    }
}