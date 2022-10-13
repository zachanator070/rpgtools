
import ModeledWikiModel, {configModeledWikiModel, modeledWikiAttributes} from "./modeled-wiki-model";


export default class ItemModel extends ModeledWikiModel {

    static attributes = {
        ...modeledWikiAttributes
    };

    static connect() {
        configModeledWikiModel(ItemModel);
    }
}