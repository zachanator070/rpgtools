
import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model";
import {ITEM} from "@rpgtools/common/src/type-constants";


export default class ItemModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(ItemModel, ITEM);
    }
}