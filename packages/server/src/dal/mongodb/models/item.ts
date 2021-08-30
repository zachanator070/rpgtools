import {Model, Schema} from "mongoose";
import { ITEM, MODEL } from "../../../../../common/src/type-constants";
import { WikiPageModel } from "./wiki-page";
import { ItemDocument } from "../../../types";

const itemSchema = new Schema<ItemDocument, Model<ItemDocument>>({
	pageModel: {
		type: Schema.Types.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const ItemModel = WikiPageModel.discriminator<ItemDocument, Model<ItemDocument>>(ITEM, itemSchema);
