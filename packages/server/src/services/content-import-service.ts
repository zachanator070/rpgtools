import { SecurityContext } from "../security/security-context";
import { FileUpload } from "graphql-upload";
import { inject, injectable } from "inversify";
import {
	Archive,
	AbstractArchiveFactory,
} from "../types";
import { Model } from "../domain-entities/model";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Image } from "../domain-entities/image";
import { WikiPage } from "../domain-entities/wiki-page";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Place } from "../domain-entities/place";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {DatabaseContext} from "../dal/database-context";
import WikiFolderFactory from "../domain-entities/factory/wiki-folder-factory";


@injectable()
export class ContentImportService {

	@inject(INJECTABLE_TYPES.ArchiveFactory)
	archiveFactory: AbstractArchiveFactory;

	@inject(INJECTABLE_TYPES.WikiFolderFactory)
	wikiFolderFactory: WikiFolderFactory;

	public importContent = async (
		context: SecurityContext,
		folderId: string,
		zipFile: FileUpload,
		databaseContext: DatabaseContext
	): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to add content to this folder");
		}

		zipFile = await zipFile;
		const archiveReadStream = zipFile.createReadStream();
		// probably need to detect here what kind of file we are dealing with then create an archive based upon the file type
		const archive = await this.archiveFactory.zipFromZipStream(archiveReadStream);

		try {
			await this.processArchive(archive, folder, databaseContext);
		} catch (e) {
			console.log(e.message);
		}

		return folder;
	};

	private processArchive = async (
		archive: Archive,
		destinationFolder: WikiFolder,
		databaseContext: DatabaseContext
	) => {
		for (let page of await archive.articleRepository.findAll()) {
			await this.importWikiPage(
				page,
				archive,
				databaseContext.articleRepository,
				destinationFolder,
				databaseContext
			);
		}
		for (let page of await archive.itemRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.itemRepository,
				destinationFolder,
				databaseContext
			);
		}
		for (let page of await archive.monsterRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.monsterRepository,
				destinationFolder,
				databaseContext
			);
		}
		for (let page of await archive.personRepository.findAll()) {
			await this.importModeledWiki(
				page,
				archive,
				databaseContext.personRepository,
				destinationFolder,
				databaseContext
			);
		}
		for (let page of await archive.placeRepository.findAll()) {
			await this.importPlace(page, archive, destinationFolder, databaseContext);
		}
		for (let model of await archive.modelRepository.findAll()) {
			await this.importModel(model, archive, destinationFolder, databaseContext);
		}
	};

	private importImage = async (
		image: Image,
		destinationFolder: WikiFolder,
		archive: Archive,
		databaseContext: DatabaseContext
	): Promise<void> => {
		const chunks = [...image.chunks];
		image.chunks = [];
		image.world = destinationFolder.world;
		if (image.icon) {
			const icon: Image = await archive.imageRepository.findOneById(image.icon);
			await this.importImage(icon, destinationFolder, archive, databaseContext);
			image.icon = icon._id;
		}
		await databaseContext.imageRepository.create(image);
		for (let chunkId of chunks) {
			const chunk = await archive.chunkRepository.findOneById(chunkId);
			const file = await archive.fileRepository.findOneById(chunk.fileId);
			await databaseContext.fileRepository.create(file);
			chunk.fileId = file._id;
			chunk.image = image._id;
			await databaseContext.chunkRepository.create(chunk);
			image.chunks.push(chunk._id);
		}
		await databaseContext.imageRepository.update(image);
	};

	private importWikiPage = async <T extends WikiPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext
	) => {
		let path: WikiFolder[] = [];
		let currentFolder: WikiFolder = await archive.wikiFolderRepository.findOneWithPage(page._id);
		while (currentFolder) {
			path.push(currentFolder);
			currentFolder = await archive.wikiFolderRepository.findOneWithChild(currentFolder._id);
		}

		path = path.reverse();

		while (path.length > 0) {
			let foundChild = false;
			const children: WikiFolder[] = await databaseContext.wikiFolderRepository.findByIds(destinationRootFolder.children);
			for (let child of children) {
				if (child.name === path[0].name) {
					foundChild = true;
					destinationRootFolder = child;
					path.shift();
				}
			}
			if (!foundChild) {
				const newFolder = this.wikiFolderFactory.build(
					{
						name: path[0].name,
						world: destinationRootFolder.world,
						pages: [],
						children: [],
						acl: []
					}
				);
				await databaseContext.wikiFolderRepository.create(newFolder);
				destinationRootFolder.children.push(newFolder._id);
				await databaseContext.wikiFolderRepository.update(destinationRootFolder);
				destinationRootFolder = newFolder;
				path.shift();
			}
		}
		if (page.coverImage) {
			const coverImage = await archive.imageRepository.findOneById(page.coverImage);
			await this.importImage(coverImage, destinationRootFolder, archive, databaseContext);
			page.coverImage = coverImage._id;
		}
		if (page.contentId) {
			const contentFile = await archive.fileRepository.findOneById(page.contentId);
			await databaseContext.fileRepository.create(contentFile);
			page.contentId = contentFile._id;
		}
		await destinationRepo.create(page);
		destinationRootFolder.pages.push(page._id);
		await databaseContext.wikiFolderRepository.update(destinationRootFolder);
	};

	private importModeledWiki = async <T extends ModeledPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext
	) => {
		if (page.pageModel) {
			const model = await archive.modelRepository.findOneById(page.pageModel);
			// delete from the source so its not recreated later
			await archive.modelRepository.delete(model);
			await this.importModel(model, archive, destinationRootFolder, databaseContext);
			page.pageModel = model._id;
		}
		await this.importWikiPage(page, archive, destinationRepo, destinationRootFolder, databaseContext);
	};

	private importPlace = async (
		page: Place,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext
	) => {
		if (page.mapImage) {
			const mapImage: Image = await archive.imageRepository.findOneById(page.mapImage);
			await this.importImage(mapImage, destinationRootFolder, archive, databaseContext);
			page.mapImage = mapImage._id;
		}
		await this.importWikiPage<Place>(
			page,
			archive,
			databaseContext.placeRepository,
			destinationRootFolder,
			databaseContext
		);
	};

	private importModel = async (
		model: Model,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		databaseContext: DatabaseContext
	) => {
		model.world = destinationRootFolder.world;
		if (model.fileId) {
			const file = await archive.fileRepository.findOneById(model.fileId);
			await databaseContext.fileRepository.create(file);
			model.fileId = file._id;
		}
		await databaseContext.modelRepository.create(model);
	};
}
