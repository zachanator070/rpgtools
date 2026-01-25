import express from "express";
import { ALL_WIKI_TYPES, MODEL, WIKI_FOLDER } from "@rpgtools/common/src/type-constants.js";
import { container } from "../di/inversify.js";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {AbstractArchiveFactory, CookieManager, SessionContextFactory} from "../types.js";
import {ContentExportService} from "../services/content-export-service.js";
import {ExpressCookieManager} from "../server/express-cookie-manager.js";

let ExportRouter = express.Router();

// Set timeout for export requests to 10 minutes (600000 ms) to handle large exports
ExportRouter.use((req, res, next) => {
	req.setTimeout(1200000); // 20 minutes
	res.setTimeout(1200000); // 20 minutes
	next();
});

ExportRouter.get("/:model/:id", async (req, res) => {
	const sessionFactory = container.get<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory);
	const cookieManager: CookieManager = new ExpressCookieManager(res);

	let refreshToken: string = null;
	let accessToken: string = null;
	if (req.cookies) {
		refreshToken = req.cookies["refreshToken"];
		accessToken = req.cookies["accessToken"];
	}
	const sessionContext = await sessionFactory.create(accessToken, refreshToken, cookieManager);

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
			filename = await service.exportWikiPage(sessionContext.securityContext, docId, modelName, archive, sessionContext.databaseContext);
		} else if (modelName === MODEL) {
			filename = await service.exportModel(sessionContext.securityContext, docId, archive, sessionContext.databaseContext);
		} else if (modelName === WIKI_FOLDER) {
			filename = await service.exportWikiFolder(sessionContext.securityContext, docId, archive, sessionContext.databaseContext);
		} else {
			return res.status(400).send(`Export type ${modelName} not supported`);
		}
		res.setHeader('Content-Disposition',`attachment;filename=${filename}.zip`);
		await archive.pipe(res);
	} catch (e) {
		return;
	}
});

export default ExportRouter;
