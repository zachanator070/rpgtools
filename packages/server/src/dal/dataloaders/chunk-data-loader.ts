import { GraphqlDataloader } from "../graphql-dataloader";
import { Chunk } from "../../domain-entities/chunk";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class ChunkDataLoader extends GraphqlDataloader<Chunk> {

	getRepository(unitOfWork: UnitOfWork): Repository<Chunk> {
		return unitOfWork.chunkRepository;
	}

}
