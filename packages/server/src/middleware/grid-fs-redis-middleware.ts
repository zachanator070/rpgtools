import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import mongodb from "mongodb";
import e from "express";
import { ExpressSessionContextFactory } from "../express-session-context-factory";
import { SessionContext } from "../types";

export const gridFsRedisMiddleware = async (key: string) => (
	req: e.Request,
	res: e.Response,
	next: e.NextFunction
) => {
	const sessionContextFactory: ExpressSessionContextFactory = new ExpressSessionContextFactory();
	const sessionContext: SessionContext = sessionContextFactory.create({
		req,
		res,
		connection: null,
	});
	const lookupKey = req.params[key];

	const searchGFS = () => {
		const gfs = new GridFSBucket(mongoose.connection.db);
		const searchParams: any = {};
		if (key === "id") {
			searchParams._id = req.params.id;
		} else {
			searchParams[key] = req.params[key];
		}
		const file = await sessionContext.fileRepository;
		gfs.find(searchParams).next((err, file) => {
			if (err) {
				return res.status(500).send();
			}
			if (file === null) {
				return res.status(404).send();
			}
			const readStream = gfs.openDownloadStream(file._id);
			res.set("Content-Type", file.contentType);
			res.setHeader("Content-disposition", `attachment; filename=${file.filename}`);
			if (redisClient) {
				// write file to cache and store for an hour, then write to response
				return readStream.pipe(redisClient.writeThrough(lookupKey, 60 * 60)).pipe(res);
			}
			return readStream.pipe(res);
		});
	};

	if (redisClient) {
		redisClient.exists(lookupKey, function (err, exists) {
			if (err) return next(err);

			if (exists) return redisClient.readStream(lookupKey).pipe(res);

			searchGFS();
		});
	} else {
		searchGFS();
	}
};
