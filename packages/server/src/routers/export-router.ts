import express from "express";
import { ALL_WIKI_TYPES, MODEL, WIKI_FOLDER } from "../../../common/src/type-constants";
import { ContentExportService } from "../services/content-export-service";
import { ExpressSessionContextFactory } from "../express-session-context-factory";
import { ZipArchiveUnitOfWork } from "../dal/zip-archive/zip-archive-unit-of-work";

let ExportRouter = express.Router();

ExportRouter.get("/:model/:id", async (req, res) => {
	const sessionFactory = new ExpressSessionContextFactory();
	const sessionContext = await sessionFactory.create({ req, res, connection: null });

	const modelName = req.params.model;
	const docId = req.params.id;

	const service = new ContentExportService();

	const unitOfWork = new ZipArchiveUnitOfWork(res);
	try {
		if (ALL_WIKI_TYPES.includes(modelName)) {
			await service.exportWikiPage(sessionContext.securityContext, docId, modelName, unitOfWork);
		} else if (modelName === MODEL) {
			await service.exportModel(sessionContext.securityContext, docId, unitOfWork);
		} else if (modelName === WIKI_FOLDER) {
			await service.exportWikiFolder(sessionContext.securityContext, docId, unitOfWork);
		} else {
			return res.status(400).send(`Export type ${modelName} not supported`);
		}

		await unitOfWork.commit();
	} catch (e) {
		return res.status(400).send(e.message);
	}
});

export default ExportRouter;
