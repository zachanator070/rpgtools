import { AllowAllRuleset } from "./allow-all-ruleset";
import { File } from "../domain-entities/file";
import { World } from "../domain-entities/world";

export class FileAuthorizationRuleset extends AllowAllRuleset<File, World> {}
