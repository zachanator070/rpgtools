import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Chunk } from "../../../domain-entities/chunk";
import { ChunkDocument, ChunkFactory, ChunkRepository, DomainEntityFactory } from "../../../types";
import { ChunkModel } from "../models/chunk";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";

@injectable()
export class MongodbChunkRepository
	extends AbstractMongodbRepository<Chunk, ChunkDocument>
	implements ChunkRepository
{
	@inject(INJECTABLE_TYPES.ChunkFactory)
	chunkFactory: ChunkFactory;

	model: mongoose.Model<any> = ChunkModel;

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
