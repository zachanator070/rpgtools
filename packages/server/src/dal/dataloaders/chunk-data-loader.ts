import { GraphqlDataloader } from "../graphql-dataloader";
import { Chunk } from "../../domain-entities/chunk";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ChunkRepository } from "../../types";
import { AllowAllRuleset } from "../../security/allow-all-ruleset";

export class ChunkDataLoader extends GraphqlDataloader<Chunk> {
	constructor(@inject(INJECTABLE_TYPES.ChunkRepository) repository: ChunkRepository) {
		super(repository, new AllowAllRuleset());
	}
}
