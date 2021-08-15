import mongoose, { Schema } from "mongoose";
import { GridFSBucket } from "mongodb";
import { IMAGE, WIKI_PAGE, WORLD } from "@rpgtools/common/src/type-constants";
import {WikiPageDocument} from "../../../types";

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
				// @ts-ignore
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

export const WikiPageModel = mongoose.model<WikiPageDocument>(WIKI_PAGE, wikiPageSchema);
