import { SecurityContext } from "../security/security-context";
import { FileUpload } from "graphql-upload";
import { World } from "../domain-entities/world";
import { inject, injectable } from "inversify";
import {
	Archive,
	AbstractArchiveFactory,
	Repository,
	UnitOfWork,
	WikiFolderFactory,
} from "../types";
import { Model } from "../domain-entities/model";
import { WikiFolder } from "../domain-entities/wiki-folder";
import { Image } from "../domain-entities/image";
import { WikiPage } from "../domain-entities/wiki-page";
import { FILTER_CONDITION_OPERATOR_IN, FilterCondition } from "../dal/filter-condition";
import { ModeledPage } from "../domain-entities/modeled-page";
import { Place } from "../domain-entities/place";
import { INJECTABLE_TYPES } from "../di/injectable-types";


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
		unitOfWork: UnitOfWork
	): Promise<World> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error("You do not have permission to add content to this folder");
		}

		zipFile = await zipFile;
		const archiveReadStream = zipFile.createReadStream();
		// probably need to detect here what kind of file we are dealing with then create an archive based upon the file type
		const archive = await this.archiveFactory.zipFromZipStream(archiveReadStream);

		try {
			await this.processArchive(archive, folder, unitOfWork);
		} catch (e) {
			console.log(e.message);
		}

		return await unitOfWork.worldRepository.findById(folder.world);
	};

	private processArchive = async (
		archive: Archive,
		destinationFolder: WikiFolder,
		unitOfWork: UnitOfWork
	) => {
		for (let page of await archive.articleRepository.find([])) {
			await this.importWikiPage(
				page,
				archive,
				unitOfWork.articleRepository,
				destinationFolder,
				unitOfWork
			);
		}
		for (let page of await archive.itemRepository.find([])) {
			await this.importModeledWiki(
				page,
				archive,
				unitOfWork.itemRepository,
				destinationFolder,
				unitOfWork
			);
		}
		for (let page of await archive.monsterRepository.find([])) {
			await this.importModeledWiki(
				page,
				archive,
				unitOfWork.monsterRepository,
				destinationFolder,
				unitOfWork
			);
		}
		for (let page of await archive.personRepository.find([])) {
			await this.importModeledWiki(
				page,
				archive,
				unitOfWork.personRepository,
				destinationFolder,
				unitOfWork
			);
		}
		for (let page of await archive.placeRepository.find([])) {
			await this.importPlace(page, archive, destinationFolder, unitOfWork);
		}
		for (let model of await archive.modelRepository.find([])) {
			await this.importModel(model, archive, destinationFolder, unitOfWork);
		}
	};

	private importImage = async (
		image: Image,
		destinationFolder: WikiFolder,
		archive: Archive,
		unitOfWork: UnitOfWork
	): Promise<void> => {
		const chunks = [...image.chunks];
		image.chunks = [];
		image.world = destinationFolder.world;
		if (image.icon) {
			const icon: Image = await archive.imageRepository.findById(image.icon);
			await this.importImage(icon, destinationFolder, archive, unitOfWork);
			image.icon = icon._id;
		}
		await unitOfWork.imageRepository.create(image);
		for (let chunkId of chunks) {
			const chunk = await archive.chunkRepository.findById(chunkId);
			const file = await archive.fileRepository.findById(chunk.fileId);
			await unitOfWork.fileRepository.create(file);
			chunk.fileId = file._id;
			chunk.image = image._id;
			await unitOfWork.chunkRepository.create(chunk);
			image.chunks.push(chunk._id);
		}
		await unitOfWork.imageRepository.update(image);
	};

	private importWikiPage = async <T extends WikiPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder,
		unitOfWork: UnitOfWork
	) => {
		let path: WikiFolder[] = [];
		let currentFolder: WikiFolder = await archive.wikiFolderRepository.findOne([
			new FilterCondition("pages", page._id, FILTER_CONDITION_OPERATOR_IN),
		]);
		while (currentFolder) {
			path.push(currentFolder);
			currentFolder = await archive.wikiFolderRepository.findOne([
				new FilterCondition("children", currentFolder._id, FILTER_CONDITION_OPERATOR_IN),
			]);
		}

		path = path.reverse();

		while (path.length > 0) {
			let foundChild = false;
			const children: WikiFolder[] = await unitOfWork.wikiFolderRepository.find([
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
				const newFolder = this.wikiFolderFactory(
					{
						_id: null,
						name: path[0].name,
						world: destinationRootFolder.world,
						pages: [],
						children: []
					}
				);
				await unitOfWork.wikiFolderRepository.create(newFolder);
				destinationRootFolder.children.push(newFolder._id);
				await unitOfWork.wikiFolderRepository.update(destinationRootFolder);
				destinationRootFolder = newFolder;
				path.shift();
			}
		}
		if (page.coverImage) {
			const coverImage = await archive.imageRepository.findById(page.coverImage);
			await this.importImage(coverImage, destinationRootFolder, archive, unitOfWork);
			page.coverImage = coverImage._id;
		}
		if (page.contentId) {
			const contentFile = await archive.fileRepository.findById(page.contentId);
			await unitOfWork.fileRepository.create(contentFile);
			page.contentId = contentFile._id;
		}
		await destinationRepo.create(page);
		destinationRootFolder.pages.push(page._id);
		await unitOfWork.wikiFolderRepository.update(destinationRootFolder);
	};

	private importModeledWiki = async <T extends ModeledPage>(
		page: T,
		archive: Archive,
		destinationRepo: Repository<T>,
		destinationRootFolder: WikiFolder,
		unitOfWork: UnitOfWork
	) => {
		if (page.pageModel) {
			const model = await archive.modelRepository.findById(page.pageModel);
			// delete from the source so its not recreated later
			await archive.modelRepository.delete(model);
			await this.importModel(model, archive, destinationRootFolder, unitOfWork);
			page.pageModel = model._id;
		}
		await this.importWikiPage(page, archive, destinationRepo, destinationRootFolder, unitOfWork);
	};

	private importPlace = async (
		page: Place,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		unitOfWork: UnitOfWork
	) => {
		if (page.mapImage) {
			const mapImage: Image = await archive.imageRepository.findById(page.mapImage);
			await this.importImage(mapImage, destinationRootFolder, archive, unitOfWork);
			page.mapImage = mapImage._id;
		}
		await this.importWikiPage<Place>(
			page,
			archive,
			unitOfWork.placeRepository,
			destinationRootFolder,
			unitOfWork
		);
	};

	private importModel = async (
		model: Model,
		archive: Archive,
		destinationRootFolder: WikiFolder,
		unitOfWork: UnitOfWork
	) => {
		model.world = destinationRootFolder.world;
		if (model.fileId) {
			const file = await archive.fileRepository.findById(model.fileId);
			await unitOfWork.fileRepository.create(file);
			model.fileId = file._id;
		}
		await unitOfWork.modelRepository.create(model);
	};
}
