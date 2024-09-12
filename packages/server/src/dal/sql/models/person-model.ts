import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model.js";
import {PERSON} from "@rpgtools/common/src/type-constants";


export default class PersonModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(PersonModel, PERSON);
    }
}