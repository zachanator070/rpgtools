import SqlModel from "./sql-model.js";
import {BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin} from "sequelize";
import WikiPageModel from "./wiki-page-model.js";


export default abstract class WikiPageChild extends SqlModel {
    getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;
    setWikiPage: BelongsToSetAssociationMixin<WikiPageModel, string>;
    createWikiPage: BelongsToCreateAssociationMixin<WikiPageModel>;
}