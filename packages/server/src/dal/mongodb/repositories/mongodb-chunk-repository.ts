import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Chunk } from "../../../domain-entities/chunk";
import {ChunkDocument, ChunkModel} from "../models/chunk";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ChunkRepository} from "../../repository/chunk-repository";
import ChunkFactory from "../../../domain-entities/factory/chunk-factory";

@injectable()
export class MongodbChunkRepository
	extends AbstractMongodbRepository<Chunk, ChunkDocument>
	implements ChunkRepository
{
	@inject(INJECTABLE_TYPES.ChunkFactory)
	chunkFactory: ChunkFactory;

	model: mongoose.Model<any> = ChunkModel;
}
