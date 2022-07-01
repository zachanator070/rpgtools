import { Readable } from "stream";
import { ZipArchive } from "./zip-archive";
import unzipper, { Entry } from "unzipper";
import { Archive, AbstractArchiveFactory, FileFactory } from "../types";
import {
	ARTICLE,
	CHUNK,
	FILE,
	ITEM,
	MODEL,
	MONSTER,
	PERSON,
	PLACE,
	WIKI_FOLDER,
	WORLD,
} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class ArchiveFactory implements AbstractArchiveFactory {
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	public createDefault = (): Archive => new ZipArchive();

	public zipFromZipStream = async (archiveReadStream: Readable): Promise<ZipArchive> => {
		const archive = new ZipArchive();
		await new Promise((resolve: (value?: any) => any, reject: (error?: any) => any) => {
			const fileReadingPromises: Promise<any>[] = [];
			archiveReadStream
				.pipe(unzipper.Parse())
				.on("entry", async (entry: Entry) => {
					fileReadingPromises.push(this.addEntryToRepository(entry, archive));
				})
				.on("error", (error) => {
					console.warn(error);
					reject(error);
				})
				.on("finish", async () => {
					await Promise.all(fileReadingPromises);
					resolve();
				});
		});
		return archive;
	};

	private addEntryToRepository = async (entry: Entry, archive: Archive): Promise<void> => {
		const entryType = this.getModelFromPath(entry.path);
		if (entryType === FILE) {
			const filename: string = this.getFilenameFromPath(entry.path);
			const id = filename.split(".")[1];
			await archive.fileRepository.create(this.fileFactory(id, filename, entry, null));
		} else {
			const entity = await this.getEntryContent(entry);
			switch (entryType) {
				case ARTICLE:
					await archive.articleRepository.create(entity);
					break;
				case CHUNK:
					await archive.chunkRepository.create(entity);
					break;
				case ITEM:
					await archive.itemRepository.create(entity);
					break;
				case MODEL:
					await archive.modelRepository.create(entity);
					break;
				case MONSTER:
					await archive.monsterRepository.create(entity);
					break;
				case PERSON:
					await archive.personRepository.create(entity);
					break;
				case PLACE:
					await archive.placeRepository.create(entity);
					break;
				case WIKI_FOLDER:
					await archive.wikiFolderRepository.create(entity);
					break;
				case WORLD:
					await archive.worldRepository.create(entity);
					break;
			}
		}
	};

	private getEntryContent = async (entry: Entry): Promise<any> => {
		const buffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
			const rawData: any[] = [];
			entry.on("data", (data) => {
				rawData.push(data);
			});
			entry.on("end", () => {
				resolve(Buffer.from(rawData));
			});
			entry.on("error", (err) => {
				reject(err);
			});
		});
		return JSON.parse(buffer.toString());
	};

	private getModelFromPath(path: string): string {
		return this.getFilenameFromPath(path).split(".")[0];
	}

	private getFilenameFromPath(path: string): string {
		const pathComponents = path.split("/");
		return pathComponents[pathComponents.length - 1];
	}
}
