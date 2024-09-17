import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model.js";
import {MONSTER} from "@rpgtools/common/src/type-constants.js";

export default class MonsterModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(MonsterModel, MONSTER);
    }
}