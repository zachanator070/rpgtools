import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import { File } from "../../../domain-entities/file.js";
import {FileRepository} from "../../repository/file-repository.js";

export class InMemoryFileRepository
	extends AbstractInMemoryRepository<File>
	implements FileRepository {

}
