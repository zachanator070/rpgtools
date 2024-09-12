import SqlModel from "./sql-model.js";
import {DataTypes} from "sequelize";


export default class WikiFolderToWikiPageModel extends SqlModel {
    static attributes = {
        WikiFolderId: {
            type: DataTypes.UUID,
        },
        WikiPageId: {
            type: DataTypes.UUID,
        },
        createdAt: {
            type: DataTypes.TIME
        },
        updatedAt: {
            type: DataTypes.TIME
        }
    }
}