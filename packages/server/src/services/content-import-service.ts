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
} from "../../../common/src/type-constants";
import unzipper, { Entry } from "unzipper";
import { SecurityContext } from "../security-context";
import { FileUpload } from "graphql-upload";
import { World } from "../domain-entities/world";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import {
	ArticleRepository,
	ChunkRepository,
	EntityAuthorizationRuleset,
	FileRepository,
	ImageRepository,
	ItemRepository,
	ModelRepository,
	MonsterRepository,
	PersonRepository,
	PlaceRepository,
	Repository,
	UnitOfWork,
	WikiFolderRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
import { WikiFolderAuthorizationRuleset } from "../security/wiki-folder-authorization-ruleset";
import { Model } from "../domain-entities/model";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Image } from "../domain-entities/image";
import { InMemoryUnitOfWork } from "../dal/in-memory/in-memory-unit-of-work";
import { File } from "../domain-entities/file";
import { WikiPage } from "../domain-entities/wiki-page";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Place } from "../domain-entities/place";

class DeferredPromise {
	promise: Promise<any>;
	resolve: (value: any) => any;
	reject: (reason: string) => any;

	constructor() {
		this.promise = new Promise((resolve: (value: any) => any, reject: (reason: string) => any) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

@injectable()
export class ContentImportService {
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.WikiFolderRepository)
	wikiFolderRepository: WikiFolderRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.ImageRepository)
	imageRepository: ImageRepository;
	@inject(INJECTABLE_TYPES.ChunkRepository)
	chunkRepository: ChunkRepository;
	@inject(INJECTABLE_TYPES.ModelRepository)
	modelRepository: ModelRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.ItemRepository)
	itemRepository: ItemRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MonsterRepository;
	@inject(INJECTABLE_TYPES.PersonRepository)
	personRepository: PersonRepository;
	@inject(INJECTABLE_TYPES.ArticleRepository)
	articleRepository: ArticleRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;

	wikiFolderAuthorizationRuleset: EntityAuthorizationRuleset<WikiFolder> = new WikiFolderAuthorizationRuleset();

	processedDocs: Map<string, DeferredPromise> = new Map<string, DeferredPromise>();

	public importContent = async (
		context: SecurityContext,
		folderId: string,
		zipFile: FileUpload
	): Promise<World> => {
		const folder = await this.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await this.wikiFolderAuthorizationRuleset.canWrite(context, folder))) {
			throw new Error("You do not have permission to add content to this folder");
		}

		zipFile = await zipFile;
		const archiveReadStream = zipFile.createReadStream();

		const unitOfWork = new InMemoryUnitOfWork();
		await new Promise((resolve: (value?: any) => any, reject: (error?: any) => any) => {
			const fileReadingPromises: Promise<any>[] = [];
			archiveReadStream
				.pipe(unzipper.Parse())
				.on("entry", async (entry: Entry) => {
					fileReadingPromises.push(this.addEntryToRepository(entry, unitOfWork));
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

		try {
			await this.processImportedEntities(unitOfWork, folder);
		} catch (e) {
			console.log(e.message);
		}

		return await this.worldRepository.findById(folder.world);
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

	private addEntryToRepository = async (entry: Entry, unitOfWork: UnitOfWork): Promise<void> => {
		const entryType = this.getModelFromPath(entry.path);
		if (entryType === FILE) {
			const filename: string = this.getFilenameFromPath(entry.path);
			const id = filename.split(".")[1];
			await unitOfWork.fileRepository.create(new File(id, filename, entry));
		} else {
			const entity = await this.getEntryContent(entry);
			switch (entryType) {
				case ARTICLE:
					await unitOfWork.articleRepository.create(entity);
					break;
				case CHUNK:
					await unitOfWork.chunkRepository.create(entity);
					break;
				case ITEM:
					await unitOfWork.itemRepository.create(entity);
					break;
				case MODEL:
					await unitOfWork.modelRepository.create(entity);
					break;
				case MONSTER:
					await unitOfWork.monsterRepository.create(entity);
					break;
				case PERSON:
					await unitOfWork.personRepository.create(entity);
					break;
				case PLACE:
					await unitOfWork.placeRepository.create(entity);
					break;
				case WIKI_FOLDER:
					await unitOfWork.wikiFolderRepository.create(entity);
					break;
				case WORLD:
					await unitOfWork.worldRepository.create(entity);
					break;
			}
		}
	};
	private async processImportedEntities(unitOfWork: UnitOfWork, destinationFolder: WikiFolder) {
		for (let page of await unitOfWork.articleRepository.find([])) {
			await this.importWikiPage(page, unitOfWork, this.articleRepository, destinationFolder);
		}
		for (let page of await unitOfWork.itemRepository.find([])) {
			await this.importModeledWiki(page, unitOfWork, this.itemRepository, destinationFolder);
		}
		for (let page of await unitOfWork.monsterRepository.find([])) {
			await this.importModeledWiki(page, unitOfWork, this.monsterRepository, destinationFolder);
		}
		for (let page of await unitOfWork.personRepository.find([])) {
			await this.importModeledWiki(page, unitOfWork, this.personRepository, destinationFolder);
		}
		for (let page of await unitOfWork.placeRepository.find([])) {
			await this.importPlace(page, unitOfWork, destinationFolder);
		}
		for (let model of await unitOfWork.modelRepository.find([])) {
			await this.importModel(model, unitOfWork, destinationFolder);
		}
	}

	async importImage(
		image: Image,
		destinationFolder: WikiFolder,
		sourceRepos: UnitOfWork
	): Promise<void> {
		const chunks = [...image.chunks];
		image.chunks = [];
		image.world = destinationFolder.world;
		if (image.icon) {
			const icon: Image = await sourceRepos.imageRepository.findById(image.icon);
			await this.importImage(icon, destinationFolder, sourceRepos);
			image.icon = icon._id;
		}
		await this.imageRepository.create(image);
		for (let chunkId of chunks) {
			const chunk = await sourceRepos.chunkRepository.findById(chunkId);
			const file = await sourceRepos.fileRepository.findById(chunk.fileId);
			await this.fileRepository.create(file);
			chunk.fileId = file._id;
			chunk.image = image._id;
			await this.chunkRepository.create(chunk);
			image.chunks.push(chunk._id);
		}
		await this.imageRepository.update(image);
	}

	async importWikiPage<T extends WikiPage>(
		page: T,
		sourceRepo: UnitOfWork,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder
	) {
		const world = await sourceRepo.worldRepository.findById(page.world);
		let path: WikiFolder[] = [];
		let currentFolder: WikiFolder = await sourceRepo.wikiFolderRepository.findOne([
			new FilterCondition("pages", page._id, FILTER_CONDITION_OPERATOR_IN),
		]);
		while (currentFolder._id !== world.rootFolder) {
			path.push(currentFolder);
			currentFolder = await sourceRepo.wikiFolderRepository.findOne([
				new FilterCondition("children", currentFolder._id, FILTER_CONDITION_OPERATOR_IN),
			]);
		}

		while (path.length > 0) {
			let foundChild = false;
			const children: WikiFolder[] = await this.wikiFolderRepository.find([
				new FilterCondition("_id", destinationRootFolder.children, FILTER_CONDITION_OPERATOR_IN),
			]);
			for (let child of children) {
				if (child.name === path[0].name) {
					foundChild = true;
					destinationRootFolder = child;
					path.shift();
				}
			}
			if (!foundChild) {
				const newFolder = new WikiFolder("", path[0].name, destinationRootFolder.world, [], []);
				await this.wikiFolderRepository.create(newFolder);
				destinationRootFolder.children.push(newFolder._id);
				await this.wikiFolderRepository.update(destinationRootFolder);
				destinationRootFolder = newFolder;
				path.shift();
			}
		}
		if (page.coverImage) {
			const coverImage = await sourceRepo.imageRepository.findById(page.coverImage);
			await this.importImage(coverImage, destinationRootFolder, sourceRepo);
			page.coverImage = coverImage._id;
		}
		if (page.contentId) {
			const contentFile = await sourceRepo.fileRepository.findById(page.contentId);
			await this.fileRepository.create(contentFile);
			page.contentId = contentFile._id;
		}
		await destinationRepo.create(page);
		destinationRootFolder.pages.push(page._id);
		await this.wikiFolderRepository.update(destinationRootFolder);
	}

	async importModeledWiki<T extends ModeledPage>(
		page: T,
		sourceRepo: UnitOfWork,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder
	) {
		if (page.model) {
			const model = await sourceRepo.modelRepository.findById(page.model);
			await this.importModel(model, sourceRepo, destinationRootFolder);
			page.model = model._id;
			// delete from the source so its not recreated later
			await sourceRepo.modelRepository.delete(model);
		}
		await this.importWikiPage(page, sourceRepo, destinationRepo, destinationRootFolder);
	}

	async importPlace(page: Place, sourceRepos: UnitOfWork, destinationRootFolder: WikiFolder) {
		if (page.mapImage) {
			const mapImage: Image = await sourceRepos.imageRepository.findById(page.mapImage);
			await this.importImage(mapImage, destinationRootFolder, sourceRepos);
			page.mapImage = mapImage._id;
		}
		await this.importWikiPage<Place>(
			page,
			sourceRepos,
			this.placeRepository,
			destinationRootFolder
		);
	}

	async importModel(model: Model, sourceRepo: UnitOfWork, destinationRootFolder: WikiFolder) {
		model.world = destinationRootFolder.world;
		if (model.fileId) {
			const file = await sourceRepo.fileRepository.findById(model.fileId);
			await this.fileRepository.create(file);
			model.fileId = file._id;
		}
		await this.modelRepository.create(model);
	}

	private getModelFromPath(path: string): string {
		return this.getFilenameFromPath(path).split(".")[0];
	}

	private getFilenameFromPath(path: string): string {
		const pathComponents = path.split("/");
		return pathComponents[pathComponents.length - 1];
	}
}
