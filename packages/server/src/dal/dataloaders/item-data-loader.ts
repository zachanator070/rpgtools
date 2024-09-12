import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Item } from "../../domain-entities/item.js";
import {injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ItemDataLoader extends GraphqlDataloader<Item> {
	getRepository(databaseContext: DatabaseContext): Repository<Item> {
		return databaseContext.itemRepository;
	}

}
