import mongoose from "mongoose";
import { WikiPage } from "./wiki-page";
import {
	FOLDER_ADMIN,
	FOLDER_ADMIN_ALL,
	FOLDER_READ,
	FOLDER_READ_ALL,
	FOLDER_READ_ALL_CHILDREN,
	FOLDER_RW,
	FOLDER_RW_ALL,
	FOLDER_RW_ALL_CHILDREN,
	ROLE_ADMIN,
	ROLE_ADMIN_ALL,
} from "@rpgtools/common/src/permission-constants";
import {
	WIKI_FOLDER,
	WIKI_PAGE,
	WORLD,
} from "@rpgtools/common/src/type-constants";

const Schema = mongoose.Schema;

const wikiFolderSchema = new Schema({
	name: {
		type: String,
		required: [true, "name field required"],
	},
	world: {
		type: mongoose.Schema.ObjectId,
		required: [true, "world field required"],
		ref: WORLD,
	},
	pages: [
		{
			type: mongoose.Schema.ObjectId,
			ref: WIKI_PAGE,
		},
	],
	children: [
		{
			type: mongoose.Schema.ObjectId,
			ref: WIKI_FOLDER,
		},
	],
});

wikiFolderSchema.methods.userCanAdmin = async function (user) {
	return (
		(await user.hasPermission(FOLDER_ADMIN, this._id)) ||
		(await user.hasPermission(FOLDER_ADMIN_ALL, this.world))
	);
};

wikiFolderSchema.methods.userCanWrite = async function (user) {
	const parentFolder = await WikiFolder.findOne({ children: this._id });
	let parentWriteAll = false;
	if (parentFolder) {
		parentWriteAll = await user.hasPermission(
			FOLDER_RW_ALL_CHILDREN,
			parentFolder._id
		);
	}
	return (
		parentWriteAll ||
		(await user.hasPermission(FOLDER_RW, this._id)) ||
		(await user.hasPermission(FOLDER_RW_ALL, this.world))
	);
};

wikiFolderSchema.methods.userCanRead = async function (user) {
	const parentFolder = await WikiFolder.findOne({ children: this._id });
	let parentReadAll = false;
	if (parentFolder) {
		parentReadAll = await user.hasPermission(
			FOLDER_READ_ALL_CHILDREN,
			parentFolder._id
		);
	}
	return (
		parentReadAll ||
		(await user.hasPermission(FOLDER_READ, this._id)) ||
		(await user.hasPermission(FOLDER_READ_ALL, this.world)) ||
		(await this.userCanWrite(user))
	);
};

wikiFolderSchema.post("remove", async function (folder) {
	await WikiPage.deleteMany({ _id: { $in: folder.pages } });
	await WikiFolder.deleteMany({ _id: { $in: folder.children } });

	const parentFolder = await WikiFolder.findOne({ children: folder._id });
	if (parentFolder) {
		parentFolder.children = parentFolder.children.filter(
			(childId) => !childId.equals(folder._id)
		);
		await parentFolder.save();
	}
});

export const WikiFolder = mongoose.model(WIKI_FOLDER, wikiFolderSchema);
