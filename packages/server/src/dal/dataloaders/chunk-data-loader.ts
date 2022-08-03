import { GraphqlDataloader } from "../graphql-dataloader";
import { Chunk } from "../../domain-entities/chunk";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ChunkRepository } from "../../types";
import { ChunkAuthorizationPolicy } from "../../security/policy/chunk-authorization-policy";

@injectable()
export class ChunkDataLoader extends GraphqlDataloader<Chunk> {

	@inject(INJECTABLE_TYPES.ChunkRepository)
	repository: ChunkRepository;

}
