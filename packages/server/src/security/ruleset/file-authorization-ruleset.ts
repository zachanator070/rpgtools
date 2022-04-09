import { AllowAllRuleset } from "./allow-all-ruleset";
import { File } from "../../domain-entities/file";
import { World } from "../../domain-entities/world";
import { injectable } from "inversify";

@injectable()
export class FileAuthorizationRuleset extends AllowAllRuleset<File, World> {}
