import SqlModel from "./sql-model.js";
import {DataTypes} from "sequelize";


export default class WikiPageToWikiPageModel extends SqlModel {
    static attributes = {
        WikiPageId: {
            type: DataTypes.UUID,
        },
        relatedWikiId: {
            type: DataTypes.UUID,
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    }

    static connect() {
    }
}