import express from 'express';
import mongodb, {GridFSBucket} from "mongodb";
import mongoose from "mongoose";

let ModelRouter = express.Router();

ModelRouter.get('/:id', (req, res) => {

	const gfs = new GridFSBucket(mongoose.connection.db);
	const id = new mongodb.ObjectID(req.params.id);
	gfs.find({_id: id}).next( (err, file) => {
		if(err){
			return res.status(500).send();
		}
		if(file === null ){
			return res.status(404).send();
		}
		const readStream = gfs.openDownloadStream(file._id);
		res.set('Content-Type', file.contentType);
		res.setHeader('Content-disposition', `attachment; filename=${file.filename}`);
		return readStream.pipe(res);
	});
});

export {ModelRouter};