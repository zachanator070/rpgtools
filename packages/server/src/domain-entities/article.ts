import { WikiPage } from "./wiki-page";
import { ARTICLE } from "../../../common/src/type-constants";

export class Article extends WikiPage {
	type: string = ARTICLE;
}
