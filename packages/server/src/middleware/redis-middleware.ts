import e from "express";
import { Cache } from "../types";
import { container } from "../di/inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {FileRepository} from "../dal/repository/file-repository";

export const redisMiddleware = (lookupKeyName: string) => async (
	req: e.Request,
	res: e.Response,
	next: e.NextFunction
) => {
	const fileRepository = container.get<FileRepository>(INJECTABLE_TYPES.FileRepository);
	const lookupKey = req.params[lookupKeyName];

	if (!lookupKey) {
		return res.status(400).send('No id given');
	}
	// for now always assume id is _id and the _id is formatted properly
	const file = await fileRepository.findOneById(lookupKey);
	if (!file) {
		return res.status(404).send('File not found');
	}
	const readStream = file.readStream;
	res.set("Content-Type", file.mimeType);
	const cache = container.get<Cache>(INJECTABLE_TYPES.Cache);
	if (await cache.exists(lookupKey)) {
		return cache.readStream(lookupKey).pipe(res);
	} else {
		// write file to cache and store for an hour, then write to response
		readStream.on('error', () => {
			res.flushHeaders();
		});
		return readStream.pipe(cache.writeStream(lookupKey, 60 * 60)).pipe(res);
	}
};
