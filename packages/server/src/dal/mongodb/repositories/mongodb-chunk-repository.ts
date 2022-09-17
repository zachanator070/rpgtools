import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Chunk } from "../../../domain-entities/chunk";
import { ChunkFactory, DomainEntityFactory } from "../../../types";
import {ChunkDocument, ChunkModel} from "../models/chunk";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ChunkRepository} from "../../repository/chunk-repository";

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
			{
				_id: document._id.toString(),
				x: document.x,
				y: document.y,
				width: document.width,
				height: document.height,
				fileId: document.fileId.toString(),
				image: document.image.toString()
			}
		);
	}
}
