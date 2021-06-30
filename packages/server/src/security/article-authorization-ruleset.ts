import { WikiPageAuthorizationRuleset } from "./wiki-page-authorization-ruleset";
import { injectable } from "inversify";

@injectable()
export class ArticleAuthorizationRuleset extends WikiPageAuthorizationRuleset {}
