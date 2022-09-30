import ModeledWikiModel, {configModeledWikiModel} from "./modeled-wiki-model";


export default class PersonModel extends ModeledWikiModel {
    static connect() {
        configModeledWikiModel(PersonModel);
    }
}