import {setupWikiPageAssociations} from "./wiki-page-model";
import {defaultAttributes} from "./default-attributes";
import WikiPageChild from "./wiki-page-child";
import {ARTICLE} from "@rpgtools/common/src/type-constants";


export default class ArticleModel extends WikiPageChild {

    static attributes = {
        ...defaultAttributes
    };

    static connect() {
        setupWikiPageAssociations(ArticleModel, ARTICLE);
    }
}