import { WIKI_ADMIN, WIKI_RW } from "../../../../common/src/permission-constants";
import { WikiPageModel } from "../../dal/mongodb/models/wiki-page";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { ARTICLE, ITEM, MONSTER, PERSON, PLACE } from "../../../../common/src/type-constants";
import { authenticated } from "../../authentication-helpers";
import { ItemModel } from "../../dal/mongodb/models/item";

export const wikiMutations = {
	createWiki: authenticated(async (parent, { name, folderId }, { currentUser }) => {}),
	updateWiki: async (parent, { wikiId, name, content, coverImageId, type }, { currentUser }) => {},
	deleteWiki: async (parent, { wikiId }, { currentUser }) => {
		const wikiPage = await WikiPageModel.findById(wikiId).populate("world");
		if (!wikiPage) {
			throw new Error("Page does not exist");
		}

		if (!(await wikiPage.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to write to this page");
		}

		if (wikiPage.world.wikiPage.equals(wikiPage._id)) {
			throw new Error("You cannot delete the main page of a world");
		}

		const parentFolder = await WikiFolder.findOne({ pages: wikiPage._id });

		if (parentFolder) {
			parentFolder.pages = parentFolder.pages.filter((page) => !page._id.equals(wikiPage._id));
			await parentFolder.save();
		}

		await cleanUpPermissions(wikiPage._id);
		await wikiPage.deleteOne();
		return wikiPage.world;
	},
	updatePlace: async (parent, { placeId, mapImageId, pixelsPerFoot }, { currentUser }) => {
		const place = await Place.findById(placeId);
		if (!place) {
			throw new Error(`Place ${placeId} does not exist`);
		}

		if (!(await place.userCanWrite(currentUser))) {
			throw new Error(`You do not have permission to write to this page`);
		}

		if (mapImageId) {
			const image = await Image.findById(mapImageId);
			if (!image) {
				throw new Error(`Image with id ${mapImageId} does not exist`);
			}
		}

		place.mapImage = mapImageId;
		place.pixelsPerFoot = pixelsPerFoot;
		await place.save();
		await place
			.populate({
				path: "mapImage",
				populate: { path: "chunks icon", populate: { path: "chunks" } },
			})
			.execPopulate();
		return place;
	},
	updateModeledWiki: async (parent, { wikiId, model, color }, { currentUser }) => {
		let wikiPage = await WikiPageModel.findById(wikiId).populate("world content");
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to write to this page");
		}
		const foundModel = await Model.findById(model);
		if (model && !foundModel) {
			throw new Error(`Model ${model} does not exist`);
		}
		wikiPage.model = foundModel;
		wikiPage.modelColor = color;
		await wikiPage.save();
		return wikiPage;
	},
	moveWiki: async (_, { wikiId, folderId }, { currentUser }) => {
		const wikiPage = await WikiPageModel.findById(wikiId).populate("world content");
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to write to this page");
		}

		const folder = await WikiFolder.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.userCanWrite(currentUser))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const oldFolder = await WikiFolder.findOne({ pages: wikiId });
		if (oldFolder && !(await oldFolder.userCanWrite(currentUser))) {
			throw new Error(`You do not have permission to write to the folder ${oldFolder._id}`);
		}

		folder.pages.push(wikiPage);
		await folder.save();
		oldFolder.pages = oldFolder.pages.filter((pageId) => !pageId.equals(wikiPage._id));
		await oldFolder.save();

		return wikiPage.world;
	},
};
