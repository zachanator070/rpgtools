import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { File } from "../../../domain-entities/file";
import {
	FILTER_CONDITION_OPERATOR_IN,
	FilterCondition,
} from "../../filter-condition";
import { PaginatedResult } from "../../paginated-result";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../../di/injectable-types";
import FilterFactory from "../FilterFactory";
import {FileRepository} from "../../repository/file-repository";
import {DatabaseSession} from "../../database-session";
import FileFactory from "../../../domain-entities/factory/file-factory";
import {v4} from "uuid";

@injectable()
export class MongodbFileRepository implements FileRepository {

	@inject(INJECTABLE_TYPES.FileFactory)
	entityFactory: FileFactory;

	@inject(INJECTABLE_TYPES.FilterFactory)
	filterFactory: FilterFactory;

	setDatabaseSession(session: DatabaseSession) {
	}

	create = async (entity: File): Promise<void> => {
		entity._id = await new Promise((resolve, reject) => {
			const _id = v4();

			const gfs = new GridFSBucket(mongoose.connection.db);
			const writeStream = gfs.openUploadStream(entity.filename, {
				contentType: entity.mimeType,
				metadata: {
					_id
				}
			});

			writeStream.on("finish", () => {
				resolve(_id);
			});

			writeStream.on("error", (err) => {
				reject(err);
				throw err;
			});

			entity.readStream.pipe(writeStream);
		});
	};

	async delete(entity: File): Promise<void> {
		return new Promise((resolve: (value?: any) => any, reject: (error?: any) => any) => {
			const gfs = new GridFSBucket(mongoose.connection.db);

			gfs.find({metadata:{_id: entity._id}}).toArray().then(found => {
				for(let file of found){
					gfs.delete(file._id, (error) => {
						if(error){
							reject(error);
						}
						resolve();
					});
				}
			})
		});
	}

	find = async (conditions: FilterCondition[]): Promise<File[]> => {
		const filter: any = this.filterFactory.build(conditions);
		const gfs = new GridFSBucket(mongoose.connection.db);
		if(filter._id) {
			filter.metadata = {
				_id: filter._id
			};
			delete filter._id;
		}
		const docs: any[] = await gfs.find(filter).toArray();
		const results: File[] = [];
		for (let doc of docs) {
			results.push(this.entityFactory.build({_id: doc.metadata._id, filename: doc.filename, readStream: gfs.openDownloadStream(doc._id), mimeType: null}));
		}
		return results;
	};

	findOneById = async (id: string): Promise<File> => {
		return this.findOne([new FilterCondition("_id", id)]);
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

	findAll() {
		return this.find([]);
	}

	findByIds(ids: string[]): Promise<File[]> {
		return this.find([new FilterCondition("_id", ids, FILTER_CONDITION_OPERATOR_IN)]);
	}

	async findByContent(searchTerms: string[]): Promise<File[]> {
		// this is crazy inefficient but mongodb doesn't support text searching file contents as far as I can tell
		const results: File[] = [];
		const allFiles = await this.findAll();
		for(let file of allFiles) {
			for(let term of searchTerms) {
				const containsTerm = await new Promise((resolve, reject) => {
					const bufferQueue: Buffer[] = [];
					let returnValue = false;
					file.readStream.on('data', (data) => {
						bufferQueue.push(data.toString());
						const currentValue = bufferQueue.join();
						if(currentValue.includes(term)) {
							returnValue = true;
							file.readStream.destroy();
						}
						if(bufferQueue.length > 3) {
							bufferQueue.shift();
						}
					});
					file.readStream.on('error', (err) => reject(err));
					file.readStream.on('close', () => { resolve(returnValue) });
				});
				if(containsTerm) {
					results.push(file);
				}
			}

		}

		return results;
	}
}
