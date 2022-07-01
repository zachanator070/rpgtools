import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryWikiFolderRepository extends AbstractInMemoryRepository<WikiFolder> {}
