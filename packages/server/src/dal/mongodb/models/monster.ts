import mongoose from "mongoose";
import { MODEL, MONSTER } from "../../../../../common/src/type-constants";
import { WikiPageModel } from "./wiki-page";
import { MonsterDocument } from "../../../types";

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
