import { Chunk } from "../../../domain-entities/chunk.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ChunkRepository} from "../../repository/chunk-repository.js";

@injectable()
export class InMemoryChunkRepository
	extends AbstractInMemoryRepository<Chunk>
	implements ChunkRepository {}
