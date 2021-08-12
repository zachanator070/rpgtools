import mongoose, { Schema } from "mongoose";
import { GridFSBucket } from "mongodb";
import { IMAGE, WIKI_PAGE, WORLD } from "../../../../../common/src/type-constants";
import { MongoDBEntity } from "../../../types";

export class WikiPageDocument extends MongoDBEntity {
	public type: string;
	public name: string;
	public world: Schema.Types.ObjectId;
	public coverImage?: Schema.Types.ObjectId;
	public contentId?: Schema.Types.ObjectId;
}

export class ModeledWikiDocument extends WikiPageDocument {
	public pageModel: Schema.Types.ObjectId;
	public modelColor: string;
}

const wikiPageSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "name field required"],
		},
		world: {
			type: Schema.Types.ObjectId,
			required: [true, "world field required"],
			ref: WORLD,
		},
		coverImage: {
			type: Schema.Types.ObjectId,
			ref: IMAGE,
		},
		contentId: {
			type: Schema.Types.ObjectId,
		},
		content: {
			type: String,
			get: async function () {
				const gfs = new GridFSBucket(mongoose.connection.db);
				const file = await gfs.find({ _id: this.contentId }).next();
				if (file) {
					const stream = gfs.openDownloadStream(file._id);
					const chunks: any[] = [];
					await new Promise((resolve: (value?: any) => void, reject) => {
						stream.on("data", (data) => {
							chunks.push(data);
						});
						stream.on("err", (err) => {
							reject(err);
						});
						stream.on("end", () => {
							resolve();
						});
					});
					return Buffer.concat(chunks).toString("utf8");
				}
				return null;
			},
		},
	},
	{
		discriminatorKey: "type",
	}
);

export const WikiPageModel = mongoose.model<ModeledWikiDocument>(WIKI_PAGE, wikiPageSchema);
