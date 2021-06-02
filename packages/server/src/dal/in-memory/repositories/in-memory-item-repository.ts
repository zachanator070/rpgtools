import { Item } from "../../../domain-entities/item";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryItemRepository extends AbstractInMemoryRepository<Item> {}
