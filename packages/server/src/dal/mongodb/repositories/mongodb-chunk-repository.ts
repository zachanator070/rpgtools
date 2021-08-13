import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Chunk } from "../../../domain-entities/chunk";
import { ChunkDocument, ChunkFactory, ChunkRepository, DomainEntityFactory } from "../../../types";
import { ChunkModel } from "../models/chunk";
import { Model } from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbChunkRepository
	extends AbstractMongodbRepository<Chunk, ChunkDocument>
	implements ChunkRepository
{
	@inject(INJECTABLE_TYPES.ChunkFactory)
	chunkFactory: ChunkFactory;

	model: Model<any> = ChunkModel;

	buildEntity(document: ChunkDocument): Chunk {
		return this.chunkFactory(
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
