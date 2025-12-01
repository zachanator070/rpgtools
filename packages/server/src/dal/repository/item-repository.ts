import {Repository} from "./repository.js";
import {Item} from "../../domain-entities/item.js";

export interface ItemRepository extends Repository<Item>{}