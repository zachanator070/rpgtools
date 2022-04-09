import { FileFactory, FileRepository } from "../../../types";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { File } from "../../../domain-entities/file";
import {
	FilterCondition,
} from "../../filter-condition";
import { PaginatedResult } from "../../paginated-result";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import FilterFactory from "../FilterFactory";

@injectable()
export class MongodbFileRepository implements FileRepository {
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	@inject(INJECTABLE_TYPES.FilterFactory)
	filterFactory: FilterFactory;

	create = async (entity: File): Promise<void> => {
		entity._id = await new Promise((resolve, reject) => {
			// @ts-ignore
			const gfs = new GridFSBucket(mongoose.connection.db);
			const writeStream = gfs.openUploadStream(entity.filename, {
				contentType: entity.mimeType,
			});

			writeStream.on("finish", (file: mongoose.Document) => {
				resolve(file._id);
			});

			writeStream.on("error", (err) => {
				reject(err);
				throw err;
			});

			// @ts-ignore
			entity.readStream.pipe(writeStream);
		});
	};

	delete(entity: File): Promise<void> {
		return new Promise((resolve: (value?: any) => any, reject: (error?: any) => any) => {
			// @ts-ignore
			const gfs = new GridFSBucket(mongoose.connection.db);

			// @ts-ignore
			gfs.delete(new mongoose.Types.ObjectId(entity._id), (error) => {
				resolve();
			});
		});
	}

	find = async (conditions: FilterCondition[]): Promise<File[]> => {
		const filter: any = this.filterFactory.build(conditions, true);
		const gfs = new GridFSBucket(mongoose.connection.db);
		const docs: any[] = await gfs.find(filter).toArray();
		const results: File[] = [];
		for (let doc of docs) {
			results.push(this.fileFactory(doc._id, doc.filename, gfs.openDownloadStream(doc._id), null));
		}
		return results;
	};

	findById = async (id: string): Promise<File> => {
		return this.findOne([new FilterCondition("_id", new mongoose.Types.ObjectId(id))]);
	};

	findOne = async (conditions: FilterCondition[]): Promise<File> => {
		const results: File[] = await this.find(conditions);
		if (results.length == 1) {
			return results[0];
		}
		return null;
	};

	update(entity: File): Promise<void> {
		throw new Error("Files are immutable");
	}

	findPaginated = async (
		conditions: FilterCondition[],
		page: number,
		sort?: string
	): Promise<PaginatedResult<File>> => {
		throw new Error("Files cannot be paginated in mongodb");
	};
}
