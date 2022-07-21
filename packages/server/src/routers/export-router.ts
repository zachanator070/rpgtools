import express from "express";
import { ALL_WIKI_TYPES, MODEL, WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {AbstractArchiveFactory, ContentExportService, SessionContextFactory} from "../types";

let ExportRouter = express.Router();

ExportRouter.get("/:model/:id", async (req, res) => {
	const sessionFactory = container.get<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory);
	const sessionContext = await sessionFactory.create({ req, res });

	const modelName = req.params.model;
	const docId = req.params.id;

	const service = container.get<ContentExportService>(INJECTABLE_TYPES.ContentExportService);

	// we will default to exporting zip archives for now, maybe later we make this configurable ?
	const archive = container
		.get<AbstractArchiveFactory>(INJECTABLE_TYPES.ArchiveFactory)
		.createDefault();

	try {
		let filename = null;
		if (ALL_WIKI_TYPES.includes(modelName)) {
			filename = await service.exportWikiPage(sessionContext.securityContext, docId, modelName, archive);
		} else if (modelName === MODEL) {
			filename = await service.exportModel(sessionContext.securityContext, docId, archive);
		} else if (modelName === WIKI_FOLDER) {
			filename = await service.exportWikiFolder(sessionContext.securityContext, docId, archive);
		} else {
			return res.status(400).send(`Export type ${modelName} not supported`);
		}
		res.setHeader('Content-Disposition',`attachment;filename=${filename}.zip`);
		await archive.pipe(res);
	} catch (e) {
		return res.status(400).send(e.message);
	}
});

export default ExportRouter;
