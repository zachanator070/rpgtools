import ModeledWikiModel, {configModeledWikiModel} from "./modeled-wiki-model";

export default class MonsterModel extends ModeledWikiModel {
    static connect() {
        configModeledWikiModel(MonsterModel);
    }
}