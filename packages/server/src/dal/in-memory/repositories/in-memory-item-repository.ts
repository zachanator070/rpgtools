import { Item } from "../../../domain-entities/item";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {ItemRepository} from "../../repository/item-repository";

@injectable()
export class InMemoryItemRepository extends AbstractInMemoryRepository<Item> implements ItemRepository{}
