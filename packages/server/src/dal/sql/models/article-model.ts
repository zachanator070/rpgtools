import WikiPageModel from "./wiki-page-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import {BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin} from "sequelize";


export default class ArticleModel extends SqlModel {

    static attributes = {
        ...defaultAttributes
    };

    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;
    createWikiPage: BelongsToCreateAssociationMixin<WikiPageModel>;

    static connect() {
        ArticleModel.hasOne(WikiPageModel, {foreignKey: 'wiki', constraints: false, scope: {type: 'Article'}});
        WikiPageModel.belongsTo(ArticleModel, {foreignKey: 'wiki', constraints: false});
    }
}