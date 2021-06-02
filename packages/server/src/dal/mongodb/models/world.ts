import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { PIN, PLACE, ROLE, WIKI_FOLDER, WORLD } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class WorldDocument extends MongoDBEntity {
	public name: string;
	public wikiPage: Schema.Types.ObjectId;
	public rootFolder: Schema.Types.ObjectId;
	public roles: Schema.Types.ObjectId[];
	public pins: Schema.Types.ObjectId[];
}

const worldSchema = new Schema({
	name: {
		type: String,
		required: [true, "name field required"],
	},
	wikiPage: {
		type: Schema.Types.ObjectId,
		ref: PLACE,
	},
	rootFolder: {
		type: Schema.Types.ObjectId,
		ref: WIKI_FOLDER,
	},
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: ROLE,
		},
	],
	pins: [
		{
			type: Schema.Types.ObjectId,
			ref: PIN,
		},
	],
});

worldSchema.plugin(mongoosePaginate);

export const WorldModel = mongoose.model<WorldDocument>(WORLD, worldSchema);
