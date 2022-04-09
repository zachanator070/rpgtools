import { DomainEntity } from "../types";
import { CHUNK } from "../../../common/src/type-constants";
import { ChunkAuthorizationRuleset } from "../security/ruleset/chunk-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Chunk implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public fileId: string;
	public image: string;

	@inject(INJECTABLE_TYPES.ChunkAuthorizationRuleset)
	authorizationRuleset: ChunkAuthorizationRuleset;
	type: string = CHUNK;
}
