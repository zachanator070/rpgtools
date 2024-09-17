import {setupWikiPageAssociations} from "./wiki-page-model.js";
import {defaultAttributes} from "./default-attributes.js";
import WikiPageChild from "./wiki-page-child.js";
import {ARTICLE} from "@rpgtools/common/src/type-constants.js";


export default class ArticleModel extends WikiPageChild {

    static attributes = {
        ...defaultAttributes
    };

    static connect() {
        setupWikiPageAssociations(ArticleModel, ARTICLE);
    }
}