import { WikiPageAuthorizationPolicy } from "./wiki-page-authorization-policy.js";
import { injectable } from "inversify";

@injectable()
export class ArticleAuthorizationPolicy extends WikiPageAuthorizationPolicy {}
