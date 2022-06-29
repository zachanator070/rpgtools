import mongoose from "mongoose";
import { ITEM, MODEL } from "@rpgtools/common/src/type-constants";
import { WikiPageModel } from "./wiki-page";
import { ItemDocument } from "../../../types";

const itemSchema = new mongoose.Schema<ItemDocument, mongoose.Model<ItemDocument>>({
	pageModel: {
		type: mongoose.Schema.Types.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const ItemModel = WikiPageModel.discriminator<ItemDocument, mongoose.Model<ItemDocument>>(
	ITEM,
	itemSchema
);
