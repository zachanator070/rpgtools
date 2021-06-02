import {Schema} from "mongoose";
import { ITEM, MODEL } from "../../../../../common/src/type-constants";
import {ModeledWikiDocument, WikiPageModel} from "./wiki-page";

export class ItemDocument extends ModeledWikiDocument{}

const itemSchema = new Schema<ItemDocument>({
	model: {
		type: Schema.Types.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const ItemModel = WikiPageModel.discriminator<ItemDocument>(ITEM, itemSchema);
