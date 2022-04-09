import { GraphqlDataloader } from "../graphql-dataloader";
import { Chunk } from "../../domain-entities/chunk";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ChunkRepository } from "../../types";
import { ChunkAuthorizationRuleset } from "../../security/ruleset/chunk-authorization-ruleset";

@injectable()
export class ChunkDataLoader extends GraphqlDataloader<Chunk> {
	constructor(
		@inject(INJECTABLE_TYPES.ChunkRepository) repository: ChunkRepository,
		@inject(INJECTABLE_TYPES.ChunkAuthorizationRuleset) ruleset: ChunkAuthorizationRuleset
	) {
		super();
		this.repository = repository;
		this.ruleset = ruleset;
	}
}
