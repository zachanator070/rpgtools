import e from "express";
import { FileRepository } from "../types";
import { container } from "../inversify.config";
import { INJECTABLE_TYPES } from "../injectable-types";
import { FilterCondition } from "../dal/filter-condition";
import { Cache } from "../types";

export const gridFsRedisMiddleware = async (key: string) => async (
	req: e.Request,
	res: e.Response,
	next: e.NextFunction
) => {
	const fileRepository = container.get<FileRepository>(INJECTABLE_TYPES.FileRepository);
	const lookupKey = req.params[key];

	const searchParams: FilterCondition[] = [];
	if (key === "id") {
		searchParams.push(new FilterCondition("_id", req.params.id));
	} else {
		searchParams.push(new FilterCondition(key, req.params[key]));
	}
	const file = await fileRepository.findOne(searchParams);
	if (!file) {
		return res.status(404).send();
	}
	const readStream = file.readStream;
	res.set("Content-Type", file.mimeType);
	res.setHeader("Content-disposition", `attachment; filename=${file.filename}`);
	const cache = container.get<Cache>(INJECTABLE_TYPES.Cache);
	if (await cache.exists(lookupKey)) {
		return cache.readStream(lookupKey).pipe(res);
	} else {
		// write file to cache and store for an hour, then write to response
		return readStream.pipe(cache.writeStream(lookupKey, 60 * 60)).pipe(res);
	}
};
