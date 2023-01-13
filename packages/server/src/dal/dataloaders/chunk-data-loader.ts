import { GraphqlDataloader } from "../graphql-dataloader";
import { Chunk } from "../../domain-entities/chunk";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ChunkDataLoader extends GraphqlDataloader<Chunk> {

	getRepository(databaseContext: DatabaseContext): Repository<Chunk> {
		return databaseContext.chunkRepository;
	}

}
