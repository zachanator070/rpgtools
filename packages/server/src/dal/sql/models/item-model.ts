
import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model.js";
import {ITEM} from "@rpgtools/common/src/type-constants.js";


export default class ItemModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(ItemModel, ITEM);
    }
}