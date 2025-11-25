import SqlModel from "./sql-model.js";
import {BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin} from "sequelize";
import WikiPageModel from "./wiki-page-model.js";


export default abstract class WikiPageChild extends SqlModel {
    declare getWikiPage: BelongsToGetAssociationMixin<WikiPageModel>;
    declare setWikiPage: BelongsToSetAssociationMixin<WikiPageModel, string>;
    declare createWikiPage: BelongsToCreateAssociationMixin<WikiPageModel>;
}