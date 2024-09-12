import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Chunk } from "../../domain-entities/chunk.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ChunkDataLoader extends GraphqlDataloader<Chunk> {

	getRepository(databaseContext: DatabaseContext): Repository<Chunk> {
		return databaseContext.chunkRepository;
	}

}
