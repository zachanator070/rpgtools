import { FileFactory, FileRepository } from "../../../types";
import { GridFSBucket } from "mongodb";
import mongoose, { Document } from "mongoose";
import { File } from "../../../domain-entities/file";
import {
	FILTER_CONDITION_OPERATOR_EQUALS,
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";
import { PaginatedResult } from "../../paginated-result";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../injectable-types";

@injectable()
export class MongodbFileRepository implements FileRepository {
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	create = async (entity: File): Promise<void> => {
		entity._id = await new Promise((resolve, reject) => {
			const gfs = new GridFSBucket(mongoose.connection.db);
			const writeStream = gfs.openUploadStream(entity.filename, {
				contentType: entity.mimeType,
			});

			writeStream.on("finish", (file: Document) => {
				resolve(file._id);
			});

			writeStream.on("error", (err) => {
				reject(err);
				throw err;
			});

			entity.readStream.pipe(writeStream);
		});
	};

	delete(entity: File): Promise<void> {
		return new Promise((resolve: (value?: any) => any, reject: (error?: any) => any) => {
			const gfs = new GridFSBucket(mongoose.connection.db);

			gfs.delete(new mongoose.Types.ObjectId(entity._id), (error) => {
				resolve();
			});
		});
	}

	find = async (conditions: FilterCondition[]): Promise<File[]> => {
		const filter: any = {};
		for (let condition of conditions) {
			if (condition.operator === FILTER_CONDITION_OPERATOR_IN) {
				filter[condition.field] = { $in: condition.value };
			} else if (condition.operator === FILTER_CONDITION_OPERATOR_EQUALS) {
				filter[condition.field] = condition.value;
			} else {
				throw new Error(`Unsupported filter operator: ${condition.operator}`);
			}
		}
		const docs: any[] = [];
		await new Promise((resolve, reject) => {
			const gfs = new GridFSBucket(mongoose.connection.db);
			gfs.find(filter).forEach(
				(doc: any) => {
					docs.push(doc);
				},
				(err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(null);
				}
			);
		});
		const results: File[] = [];
		const gfs = new GridFSBucket(mongoose.connection.db);
		for (let doc of docs) {
			results.push(this.fileFactory(doc._id, doc.filename, gfs.openDownloadStream(doc._id), null));
		}
		return results;
	};

	findById = async (id: string): Promise<File> => {
		return this.findOne([new FilterCondition("_id", id)]);
	};

	findOne = async (conditions: FilterCondition[]): Promise<File> => {
		const results: File[] = await this.find(conditions);
		if (results.length > 1) {
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
