import { AllowAllRuleset } from "./allow-all-ruleset";
import { Chunk } from "../domain-entities/chunk";
import { Image } from "../domain-entities/image";
import { injectable } from "inversify";

@injectable()
export class ChunkAuthorizationRuleset extends AllowAllRuleset<Chunk, Image> {}
