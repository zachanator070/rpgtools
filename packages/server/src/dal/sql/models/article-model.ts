import WikiPageModel, {setupWikiPageAssociations} from "./wiki-page-model";
import SqlModel from "./sql-model";
import {defaultAttributes} from "./default-attributes";
import {BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin} from "sequelize";
import WikiPageChild from "./wiki-page-child";


export default class ArticleModel extends WikiPageChild {

    static attributes = {
        ...defaultAttributes
    };

    static connect() {
        setupWikiPageAssociations(ArticleModel, 'Article');
    }
}