import { Item } from "../../../domain-entities/item.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ItemRepository} from "../../repository/item-repository.js";

@injectable()
export class InMemoryItemRepository extends AbstractInMemoryRepository<Item> implements ItemRepository{}
