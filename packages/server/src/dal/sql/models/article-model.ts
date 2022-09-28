import {Model} from "sequelize";
import configWikiPageModel from "./config-wiki-page-model";


export default class ArticleModel extends Model {
    static connect() {
        configWikiPageModel(ArticleModel);
    }
}