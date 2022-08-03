import { WikiPageAuthorizationPolicy } from "./wiki-page-authorization-policy";
import { injectable } from "inversify";

@injectable()
export class ArticleAuthorizationPolicy extends WikiPageAuthorizationPolicy {}
