import { getGfsFileFromFileId, getReadStreamFromFile } from "../db-helpers";
import { Readable } from "stream";
import { WikiFolder } from "../models/wiki-folder";
import { MODELED_WIKI_TYPES, PLACE } from "../../../common/src/type-constants";
import { WikiPage } from "../models/wiki-page";
import { Model } from "../models/model";

export const exportWikiPage = async (docId, archive, currentUser, res, errorOut = true) => {
	const page = await WikiPage.findById(docId).populate({
		path: "coverImage world",
		populate: {
			path: "chunks icon",
			populate: {
				path: "chunks",
			},
		},
	});
	if (!page) {
		return res.sendStatus(404);
	}
	if (!(await page.userCanRead(currentUser))) {
		if (errorOut) {
			return res.sendStatus(403);
		}
		return;
	}
	await addWikiPageToArchive(page, archive);
};

export const exportModel = async (docId, archive, currentUser, res) => {
	const model = await Model.findById(docId);
	if (!model) {
		return res.sendStatus(404);
	}
	if (!(await model.userCanRead(currentUser))) {
		return res.sendStatus(403);
	}
	await addModelToArchive(model, archive);
};

export const exportWikiFolder = async (docId, archive, currentUser, res) => {
	const folder = await WikiFolder.findById(docId);
	if (!folder) {
		return res.sendStatus(404);
	}
	if (!(await folder.userCanRead(currentUser))) {
		return res.sendStatus(403);
	}

	for (let pageId of folder.pages) {
		await exportWikiPage(pageId, archive, currentUser, res, false);
	}
	for (let childId of folder.children) {
		await exportWikiFolder(childId, archive, currentUser, res);
	}
};

const addImageToArchive = async (image, archive, path) => {
	for (let chunk of image.chunks) {
		const chunkFile = await getGfsFileFromFileId(chunk.fileId);
		const chunkPath = path + chunkFile.filename;
		archive.append(getReadStreamFromFile(chunkFile), { name: chunkPath });
		chunk.fileId = chunkPath;
	}
};

export const addModelToArchive = async (model, archive) => {
	const modelFile = await getGfsFileFromFileId(model.fileId);
	const modelDataFilePath = "models/" + modelFile.filename;

	archive.append(getReadStreamFromFile(modelFile), { name: modelDataFilePath });
	const modelObject = model.toJSON();
	modelObject.fileId = modelDataFilePath;
	const modelExportedFilename = `models/Model.${modelObject._id}.json`;
	archive.append(Readable.from([JSON.stringify(modelObject)]), {
		name: modelExportedFilename,
	});
	return modelExportedFilename;
};

export const addWikiPageToArchive = async (page, archive) => {
	let pageObject = page.toJSON();

	let path = "wikis/";
	let parent = await WikiFolder.findOne({ pages: page._id });
	while (!parent._id.equals(page.world.rootFolder)) {
		path += parent.name + "/";
		parent = await WikiFolder.findOne({ children: parent._id });
	}

	if (page.constructor.modelName === PLACE) {
		await page
			.populate({
				path: "mapImage",
				populate: {
					path: "icon chunks",
					populate: {
						path: "chunks",
					},
				},
			})
			.execPopulate();
		pageObject = page.toJSON();
		if (pageObject.mapImage) {
			await addImageToArchive(pageObject.mapImage, archive, path);
			if (pageObject.mapImage.icon) {
				await addImageToArchive(pageObject.mapImage.icon, archive, path);
			}
		}
	} else if (MODELED_WIKI_TYPES.includes(page.constructor.modelName)) {
		await page.populate("model").execPopulate();
		pageObject = page.toJSON();
		if (page.model) {
			pageObject.model = await addModelToArchive(page.model, archive);
		}
	}

	if (pageObject.coverImage) {
		await addImageToArchive(pageObject.coverImage, archive, path);
		if (pageObject.coverImage.icon) {
			await addImageToArchive(pageObject.coverImage.icon, archive, path);
		}
	}
	if (pageObject.contentId) {
		const contentFile = await getGfsFileFromFileId(pageObject.contentId);
		const contentPath = path + contentFile.filename;
		archive.append(getReadStreamFromFile(contentFile), { name: contentPath });
		pageObject.contentId = contentPath;
	}

	archive.append(Readable.from([JSON.stringify(pageObject)]), {
		name: `${path}${page.constructor.modelName}.${pageObject._id}.json`,
	});
};
