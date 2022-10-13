import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Item } from "../../../domain-entities/item";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import {ItemDocument, ItemModel} from "../models/item";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import {ItemRepository} from "../../repository/item-repository";
import ItemFactory from "../../../domain-entities/factory/item-factory";

@injectable()
export class MongodbItemRepository
	extends AbstractMongodbRepository<Item, ItemDocument>
	implements ItemRepository
{
	@inject(INJECTABLE_TYPES.ItemFactory)
	entityFactory: ItemFactory;

	model: mongoose.Model<any> = ItemModel;

}
