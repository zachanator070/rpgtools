import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Item } from "../../../domain-entities/item";
import { inject, injectable } from "inversify";
import { ItemFactory, ItemRepository } from "../../../types";
import mongoose from "mongoose";
import {ItemDocument, ItemModel} from "../models/item";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import AclFactory from "./acl-factory";

@injectable()
export class MongodbItemRepository
	extends AbstractMongodbRepository<Item, ItemDocument>
	implements ItemRepository
{
	@inject(INJECTABLE_TYPES.ItemFactory)
	itemFactory: ItemFactory;

	model: mongoose.Model<any> = ItemModel;

	buildEntity(document: ItemDocument): Item {
		return this.itemFactory(
			{
				_id: document._id.toString(),
				name: document.name,
				world: document.world.toString(),
				coverImage: document.coverImage ? document.coverImage.toString() : null,
				content: document.contentId ? document.contentId.toString() : null,
				pageModel: document.pageModel ? document.pageModel.toString() : null,
				modelColor: document.modelColor,
				acl: AclFactory(document.acl)
			}
		);
	}
}
