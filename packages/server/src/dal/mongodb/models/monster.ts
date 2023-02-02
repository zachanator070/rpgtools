import mongoose from "mongoose";
import {MODEL, MONSTER} from "@rpgtools/common/src/type-constants";
import {WikiPageModel} from "./wiki-page";
import {ModeledWikiDocument} from "../../../types";
import {v4} from "uuid";

export interface MonsterDocument extends ModeledWikiDocument {
}

const monsterSchema = new mongoose.Schema<MonsterDocument, mongoose.Model<MonsterDocument>>({
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

export const MonsterModel = WikiPageModel.discriminator<
	MonsterDocument,
	mongoose.Model<MonsterDocument>
>(MONSTER, monsterSchema);
