import mongoose from "mongoose";
import {MODEL, MONSTER} from "@rpgtools/common/src/type-constants";
import {WikiPageModel} from "./wiki-page";
import {ModeledWikiDocument} from "../../../types";

export interface MonsterDocument extends ModeledWikiDocument {
}

const monsterSchema = new mongoose.Schema<MonsterDocument, mongoose.Model<MonsterDocument>>({
	pageModel: {
		type: mongoose.Schema.Types.ObjectId,
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
