import WikiPageModel from "./wiki-page-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import {BelongsToGetAssociationMixin} from "sequelize";


export default class ArticleModel extends SqlModel {

    static attributes = {
        ...defaultAttributes
    };

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;

    static connect() {
        ArticleModel.belongsTo(WikiPageModel);
    }
}