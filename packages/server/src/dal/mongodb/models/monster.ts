import {Schema} from "mongoose";
import { MODEL, MONSTER } from "../../../../../common/src/type-constants";
import {ModeledWikiDocument, WikiPageModel} from "./wiki-page";

export class MonsterDocument extends ModeledWikiDocument{}

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
