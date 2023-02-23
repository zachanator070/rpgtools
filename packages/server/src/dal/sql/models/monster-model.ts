import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model";
import {MONSTER} from "@rpgtools/common/src/type-constants";

export default class MonsterModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(MonsterModel, MONSTER);
    }
}