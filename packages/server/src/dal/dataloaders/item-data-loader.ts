import { GraphqlDataloader } from "../graphql-dataloader";
import { Item } from "../../domain-entities/item";
import {injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class ItemDataLoader extends GraphqlDataloader<Item> {
	getRepository(unitOfWork: UnitOfWork): Repository<Item> {
		return unitOfWork.itemRepository;
	}

}
