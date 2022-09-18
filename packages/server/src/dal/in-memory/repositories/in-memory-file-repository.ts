import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import { File } from "../../../domain-entities/file";
import {FileRepository} from "../../repository/file-repository";

export class InMemoryFileRepository
	extends AbstractInMemoryRepository<File>
	implements FileRepository {}
