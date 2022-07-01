import { FileRepository } from "../../../types";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import { File } from "../../../domain-entities/file";

export class InMemoryFileRepository
	extends AbstractInMemoryRepository<File>
	implements FileRepository {}
