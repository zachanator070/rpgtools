import { GraphqlDataloader } from "../graphql-dataloader";
import { Item } from "../../domain-entities/item";
import {injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ItemDataLoader extends GraphqlDataloader<Item> {
	getRepository(databaseContext: DatabaseContext): Repository<Item> {
		return databaseContext.itemRepository;
	}

}
