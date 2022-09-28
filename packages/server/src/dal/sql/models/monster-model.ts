import {Model} from "sequelize";
import configModeledWikiModel from "./config-modeled-wiki-model";

export default class MonsterModel extends Model {
    static connect() {
        configModeledWikiModel(MonsterModel);
    }
}