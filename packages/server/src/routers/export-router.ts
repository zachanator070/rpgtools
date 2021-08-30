import express from "express";
import { ALL_WIKI_TYPES, MODEL, WIKI_FOLDER } from "../../../common/src/type-constants";
import { ExpressSessionContextFactory } from "../express-session-context-factory";
import { container } from "../inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { AbstractArchiveFactory, ContentExportService } from "../types";

let ExportRouter = express.Router();

ExportRouter.get("/:model/:id", async (req, res) => {
	const sessionFactory = new ExpressSessionContextFactory();
	const sessionContext = await sessionFactory.create({ req, res, connection: null });

	const modelName = req.params.model;
	const docId = req.params.id;

	const service = container.get<ContentExportService>(INJECTABLE_TYPES.ContentExportService);

	// we will default to exporting zip archives for now, maybe later we make this configurable ?
	const archive = container
		.get<AbstractArchiveFactory>(INJECTABLE_TYPES.ArchiveFactory)
		.createDefault();

	try {
		if (ALL_WIKI_TYPES.includes(modelName)) {
			await service.exportWikiPage(sessionContext.securityContext, docId, modelName, archive);
		} else if (modelName === MODEL) {
			await service.exportModel(sessionContext.securityContext, docId, archive);
		} else if (modelName === WIKI_FOLDER) {
			await service.exportWikiFolder(sessionContext.securityContext, docId, archive);
		} else {
			return res.status(400).send(`Export type ${modelName} not supported`);
		}

		await archive.pipe(res);
	} catch (e) {
		return res.status(400).send(e.message);
	}
});

export default ExportRouter;
