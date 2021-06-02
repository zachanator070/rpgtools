import { Chunk } from "../../../domain-entities/chunk.";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import { ChunkRepository } from "../../../types";

@injectable()
export class InMemoryChunkRepository
	extends AbstractInMemoryRepository<Chunk>
	implements ChunkRepository {}
