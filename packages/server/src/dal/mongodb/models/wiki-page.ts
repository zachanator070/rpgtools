import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { GridFSBucket } from "mongodb";
import { IMAGE, PLACE, WIKI_PAGE, WORLD } from "../../../../../common/src/type-constants";
import { deleteImage } from "../../../resolvers/mutations/image-mutations";
import { MongoDBEntity } from "../../../types";

export class WikiPageDocument extends MongoDBEntity {
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
					const chunks = [];
					await new Promise((resolve, reject) => {
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

wikiPageSchema.pre("deleteOne", { document: true, query: false }, async function () {
	if (this.coverImage) {
		await deleteImage(this.coverImage);
	}
	if (this.contentId) {
		await deleteGfsFile(this.contentId);
	}
	// doing this to avoid circular dependency
	const pinModel = mongoose.model("Pin");
	const pins = await pinModel.find({ page: this._id });
	for (let pin of pins) {
		pin.page = null;
		await pin.save();
	}
});

wikiPageSchema.plugin(mongoosePaginate);

export const WikiPageModel = mongoose.model<ModeledWikiDocument>(WIKI_PAGE, wikiPageSchema);
