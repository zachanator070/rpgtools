import express from "express";
import {createSessionContext} from "../authentication-helpers";
import {ARTICLE} from "../../../common/src/type-constants";
import {Article} from "../models/article";

let ExportRouter = express.Router();

ExportRouter.get('/:model/:id', async (req, res) => {
	const context = await createSessionContext({req, res, connection: null});
	const currentUser = context.currentUser;
	const modelName = req.params.model;
	const docId = req.params.id;

	switch (modelName){
		case ARTICLE:
			const page = await Article.findById(docId);
			if(!page){
				return res.sendStatus(404);
			}
			if(!await page.userCanRead(currentUser)){
				return res.sendStatus(403);
			}


	}

});

export default ExportRouter;