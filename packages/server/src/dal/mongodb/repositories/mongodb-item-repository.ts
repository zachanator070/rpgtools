import { AbstractMongodbRepository } from "./abstract-mongodb-repository";
import { Item } from "../../../domain-entities/item";
import { injectable } from "inversify";
import { ItemRepository } from "../../../types";
import { Model } from "mongoose";
import { ItemDocument, ItemModel } from "../models/item";

@injectable()
export class MongodbItemRepository
	extends AbstractMongodbRepository<Item, ItemDocument>
	implements ItemRepository
{
	model: Model<any> = ItemModel;

	buildEntity(document: ItemDocument): Item {
		return new Item(
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
