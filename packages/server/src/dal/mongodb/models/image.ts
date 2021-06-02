import mongoose, {Schema} from "mongoose";
import { CHUNK, IMAGE, WORLD } from "../../../../../common/src/type-constants";
import {MongoDBEntity} from "../../../types";

export class ImageDocument extends MongoDBEntity{
	public world: Schema.Types.ObjectId;
	public width: number;
	public height: number;
	public chunkWidth: number;
	public chunkHeight: number;
	public chunks: Schema.Types.ObjectId[];
	public icon: Schema.Types.ObjectId;
	public name: string;
}

const imageSchema = new Schema({
	world: {
		type: Schema.Types.ObjectId,
		ref: WORLD,
		required: [true, "worldId required"],
	},
	width: {
		type: Number,
		required: [true, "width required"],
	},
	height: {
		type: Number,
		required: [true, "height required"],
	},
	chunkWidth: {
		type: Number,
	},
	chunkHeight: {
		type: Number,
	},
	chunks: [
		{
			type: Schema.Types.ObjectId,
			ref: CHUNK,
		},
	],
	icon: {
		type: Schema.Types.ObjectId,
		ref: IMAGE,
	},
	name: {
		type: String,
		required: [true, "name required"],
	},
});

export const ImageModel = mongoose.model<ImageDocument>(IMAGE, imageSchema);
