import { WikiPage } from "./wiki-page";
import { ARTICLE } from "../../../common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Article extends WikiPage {
	type: string = ARTICLE;
}
