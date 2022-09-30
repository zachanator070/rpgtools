
import ModeledWikiModel, {configModeledWikiModel} from "./modeled-wiki-model";


export default class ItemModel extends ModeledWikiModel {
    static connect() {
        configModeledWikiModel(ItemModel);
    }
}