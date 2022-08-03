import { AllowAllPolicy } from "./allow-all-policy";
import { Chunk } from "../../domain-entities/chunk";
import { injectable } from "inversify";

@injectable()
export class ChunkAuthorizationPolicy extends AllowAllPolicy<Chunk> {}
