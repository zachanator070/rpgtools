import WikiPageModel, {configWikiPageModel} from "./wiki-page-model";


export default class ArticleModel extends WikiPageModel {

    static connect() {
        configWikiPageModel(ArticleModel);
    }
}