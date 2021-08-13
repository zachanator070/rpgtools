import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Item } from "../../../domain-entities/item";
import { inject, injectable } from "inversify";
import { ItemDocument, ItemFactory, ItemRepository } from "../../../types";
import { Model } from "mongoose";
import { ItemModel } from "../models/item";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbItemRepository
	extends AbstractMongodbRepository<Item, ItemDocument>
	implements ItemRepository
{
	@inject(INJECTABLE_TYPES.ItemFactory)
	itemFactory: ItemFactory;

	model: Model<any> = ItemModel;

	buildEntity(document: ItemDocument): Item {
		return this.itemFactory(
			document._id.toString(),
			document.name,
			document.world.toString(),
			document.coverImage ? document.coverImage.toString() : null,
			document.contentId ? document.contentId.toString() : null,
			document.pageModel ? document.pageModel.toString() : null,
			document.modelColor
		);
	}
}
