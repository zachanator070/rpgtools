import mongoose from "mongoose";
import {ITEM, MODEL} from "@rpgtools/common/src/type-constants";
import {WikiPageModel} from "./wiki-page";
import {ModeledWikiDocument} from "../../../types";
import {v4} from "uuid";

export interface ItemDocument extends ModeledWikiDocument {
}

const itemSchema = new mongoose.Schema<ItemDocument, mongoose.Model<ItemDocument>>({
	_id: {
		type: String,
		default: v4
	},
	pageModel: {
		type: String,
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
