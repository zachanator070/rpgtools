import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Chunk } from "../../../domain-entities/chunk.";
import { ChunkRepository, DomainEntityFactory } from "../../../types";
import { ChunkDocument, ChunkModel } from "../models/chunk";
import { Model } from "mongoose";
import { injectable } from "inversify";

@injectable()
export class MongodbChunkRepository
	extends AbstractMongodbRepository<Chunk, ChunkDocument>
	implements ChunkRepository {
	model: Model<any> = ChunkModel;

	buildEntity(document: ChunkDocument): Chunk {
		return new Chunk(
			document._id.toString(),
			document.x,
			document.y,
			document.width,
			document.height,
			document.fileId.toString(),
			document.image.toString()
		);
	}
}
