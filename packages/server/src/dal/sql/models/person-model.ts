import {Model, Sequelize} from "sequelize";
import configModeledWikiModel, {modeledWikiAttributes} from "./config-modeled-wiki-model";


export default class PersonModel extends Model {
    static connect() {
        configModeledWikiModel(PersonModel);
    }
}