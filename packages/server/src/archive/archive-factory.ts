import { Readable } from "stream";
import { ZipArchive } from "./zip-archive";
import unzipper, { Entry } from "unzipper";
import {Archive, AbstractArchiveFactory, FileFactory, Factory, WikiFolderFactory} from "../types";
import {
	ARTICLE,
	CHUNK,
	FILE, IMAGE,
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
import {WikiFolder} from "../domain-entities/wiki-folder";
import {WikiPage} from "../domain-entities/wiki-page";

class TempFolder {
	children: TempFolder[] = [];
	name: string;
}

@injectable()
export class ArchiveFactory implements AbstractArchiveFactory {
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	@inject(INJECTABLE_TYPES.ZipArchiveFactory)
	zipArchiveFactory: Factory<ZipArchive>;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	public createDefault = (): Archive => this.zipArchiveFactory({});

	public zipFromZipStream = async (archiveReadStream: Readable): Promise<ZipArchive> => {
		const archive = this.zipArchiveFactory({});
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

	private readFile = async (entry: Entry): Promise<Buffer> => {
		const chunks: Buffer[] = [];
		return await new Promise((resolve, reject) => {
			entry.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			entry.on('error', (err) => reject(err));
			entry.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	private createReadStream = async (entry: Entry): Promise<Readable> => {
		return Readable.from(await this.readFile(entry));
	}

	private addEntryToRepository = async (entry: Entry, archive: Archive): Promise<void> => {
		const entryType = this.getModelFromPath(entry.path);
		if (entryType === FILE) {
			const filename: string = this.getFilenameFromPath(entry.path);
			const id = filename.split(".")[1];
			const newFile = this.fileFactory({_id: id, filename, readStream: await this.createReadStream(entry), mimeType: null})
			await archive.fileRepository.create(newFile);
		} else {
			const entity = await this.getEntryContent(entry);
			switch (entryType) {
				case ARTICLE:
					await archive.articleRepository.create(entity);
					await this.addWikiToFolder(entity, entry.path, archive);
					break;
				case CHUNK:
					await archive.chunkRepository.create(entity);
					break;
				case ITEM:
					await archive.itemRepository.create(entity);
					await this.addWikiToFolder(entity, entry.path, archive);
					break;
				case IMAGE:
					await archive.imageRepository.create(entity);
					break;
				case MODEL:
					await archive.modelRepository.create(entity);
					break;
				case MONSTER:
					await archive.monsterRepository.create(entity);
					await this.addWikiToFolder(entity, entry.path, archive);
					break;
				case PERSON:
					await archive.personRepository.create(entity);
					await this.addWikiToFolder(entity, entry.path, archive);
					break;
				case PLACE:
					await archive.placeRepository.create(entity);
					await this.addWikiToFolder(entity, entry.path, archive);
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

	private async addWikiToFolder(wikiPage: WikiPage, path: string, archive: Archive) {
		const wikiFolder = await this.addPath(path.split('/').slice(1, -1).join('/'), null, archive);
		wikiFolder.pages.push(wikiPage._id);
		await archive.wikiFolderRepository.update(wikiFolder);
	}

	private async addPath(path: string,  currentFolder: WikiFolder, archive: Archive): Promise<WikiFolder> {
		const nextFolderName = path.split('/')[0];
		const currentFolderChildren = currentFolder ? await Promise.all(currentFolder.children.map(async child => await archive.wikiFolderRepository.findById(child))) : [];
		let nextFolder = currentFolderChildren.find(folder => folder.name === nextFolderName);
		if (!nextFolder) {
			nextFolder = await this.addFolder(nextFolderName, currentFolder, archive);
		}

		if (path.split('/').length !== 1) {
			return this.addPath(path.split('/').slice(1).join(), nextFolder, archive);
		}
		return nextFolder;
	}

	private async addFolder(name: string, currentFolder: WikiFolder, archive: Archive) {
		const newFolder = this.wikiFolderFactory(
			{
				_id: null,
				name,
				world: null,
				pages: [],
				children: []
			}
		);
		await archive.wikiFolderRepository.create(newFolder);
		if (currentFolder) {
			currentFolder.children.push(newFolder._id);
			await archive.wikiFolderRepository.update(currentFolder);
		}
		return newFolder;
	}

	private getEntryContent = async (entry: Entry): Promise<any> => {
		const buffer: Buffer = await this.readFile(entry);
		const bufferContent = buffer.toString('utf-8');
		return JSON.parse(bufferContent);
	};

	private getModelFromPath(path: string): string {
		return this.getFilenameFromPath(path).split(".")[0];
	}

	private getFilenameFromPath(path: string): string {
		const pathComponents = path.split("/");
		return pathComponents[pathComponents.length - 1];
	}
}
