import { Schema } from "mongoose";
import { MODEL, MONSTER } from "../../../../../common/src/type-constants";
import { WikiPageModel } from "./wiki-page";
import { MonsterDocument } from "../../../types";

const monsterSchema = new Schema<MonsterDocument>({
	model: {
		type: Schema.Types.ObjectId,
		ref: MODEL,
	},
	modelColor: {
		type: String,
	},
});

export const MonsterModel = WikiPageModel.discriminator<MonsterDocument>(MONSTER, monsterSchema);
