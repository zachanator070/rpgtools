import {DataTypes} from "sequelize";
import {defaultAttributes} from "../default-attributes.js";
import ModelModel from "../model-model.js";
import ArticleModel from "../article-model.js";
import SqlModel from "../sql-model.js";
import {GAME, MODEL} from "@rpgtools/common/src/type-constants.js";
import {TOKEN_TYPES} from "@rpgtools/common/src/token-type-constants.js";
import TokenIconModel from "../token-icon-model.js";
import { GenericRpgToolsAPIError, RpgToolsAPIError } from "../../../../errors.js";


export default class InGameModelModel extends SqlModel {

    declare x: number;
    declare z: number;
    declare lookAtX: number;
    declare lookAtZ: number;
    declare color: string;

    declare modelId: string;
    declare wikiId: string;
    declare tokenId: string;
    declare tokenType: string;

    static attributes = {
        ...defaultAttributes,
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lookAtZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
        },
        GameId: {
            type: DataTypes.UUID,
            references: {
                model: GAME,
                key: '_id'
            }
        },
        modelId: {
            type: DataTypes.UUID,
            references: {
                model: MODEL,
                key: '_id'
            }
        },
        wikiId: {
            type: DataTypes.UUID,
        },
        tokenId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'TokenIcon',
                key: '_id'
            }
        },
        tokenType: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isValidTokenType(value: any) {
                    const validTypes = Object.values(TOKEN_TYPES);
                    if (value && !validTypes.includes(value)) {
                        throw new GenericRpgToolsAPIError(`tokenType must be one of: ${validTypes.join(', ')}`);
                    }
                }
            }
        }
    };

    static connect() {
        InGameModelModel.belongsTo(ModelModel, {as: 'model'});
        InGameModelModel.belongsTo(ArticleModel, {as: 'wiki', constraints: false});
        InGameModelModel.belongsTo(TokenIconModel, {as: 'token'});
    }
}