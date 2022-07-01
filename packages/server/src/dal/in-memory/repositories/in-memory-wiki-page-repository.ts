import { injectable } from "inversify";
import { WikiPage } from "../../../domain-entities/wiki-page";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryWikiPageRepository extends AbstractInMemoryRepository<WikiPage> {}
