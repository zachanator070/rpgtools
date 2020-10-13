import express from "express";
import {createSessionContext} from "../authentication-helpers";
import {ALL_WIKI_TYPES, MODEL, WIKI_FOLDER} from "../../../common/src/type-constants";
import archiver from 'archiver';
import { exportModel, exportWikiFolder,	exportWikiPage } from "../contentImportExport/export";

let ExportRouter = express.Router();

ExportRouter.get('/:model/:id', async (req, res) => {
	const context = await createSessionContext({req, res, connection: null});
	const currentUser = context.currentUser;
	const modelName = req.params.model;
	const docId = req.params.id;

	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});

	try{
		archive.on('warning', function(err) {
			if (err.code === 'ENOENT') {
				console.warning(err.message);
			} else {
				// throw error
				throw err;
			}
		});

		archive.on('error', function(err) {
			throw err;
		});

		archive.pipe(res);

		if(ALL_WIKI_TYPES.includes(modelName)){
			await exportWikiPage(docId, archive, currentUser, res);

		}
		else if(modelName === MODEL){
			await exportModel(docId, archive, currentUser, res);
		}
		else if(modelName === WIKI_FOLDER){
			await exportWikiFolder(docId, archive, currentUser, res);
		}
		else{
			return res.status(400).send(`Export type ${modelName} not supported`);
		}

		return archive.finalize();
	}
	catch (e) {
		return res.status(400).send(e.message);
	}

});

export default ExportRouter;