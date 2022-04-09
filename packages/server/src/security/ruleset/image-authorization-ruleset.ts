import { AllowAllRuleset } from "./allow-all-ruleset";
import { Image } from "../../domain-entities/image";
import { World } from "../../domain-entities/world";
import { injectable } from "inversify";

@injectable()
export class ImageAuthorizationRuleset extends AllowAllRuleset<Image, World> {}
