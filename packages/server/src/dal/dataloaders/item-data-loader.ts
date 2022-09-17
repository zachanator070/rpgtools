import { GraphqlDataloader } from "../graphql-dataloader";
import { Item } from "../../domain-entities/item";
import {injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class ItemDataLoader extends GraphqlDataloader<Item> {
	getRepository(unitOfWork: UnitOfWork): Repository<Item> {
		return unitOfWork.itemRepository;
	}

}
