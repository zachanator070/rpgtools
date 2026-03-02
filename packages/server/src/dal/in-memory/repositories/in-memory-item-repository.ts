import { Item } from "../../../domain-entities/item.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ItemRepository} from "../../repository/item-repository.js";
import {inMemoryWikiPageStore} from "./in-memory-wiki-page-store.js";

@injectable()
export class InMemoryItemRepository extends AbstractInMemoryRepository<Item> implements ItemRepository{
	items = inMemoryWikiPageStore as Map<string, Item>;
}
