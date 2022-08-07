import { inject, injectable } from "inversify";
import { SecurityContext } from "../security/security-context";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import { WIKI_ADMIN, WIKI_RW } from "@rpgtools/common/src/permission-constants";
import { Readable } from "stream";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../dal/filter-condition";
import {
	ArticleFactory,
	FileFactory,
	ItemFactory,
	MonsterFactory,
	PermissionAssignmentFactory,
	PersonFactory,
	PlaceFactory, UnitOfWork,
} from "../types";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { ModeledPage } from "../domain-entities/modeled-page";
import { WikiPage } from "../domain-entities/wiki-page";
import { PaginatedResult } from "../dal/paginated-result";
import {AuthorizationService} from "./authorization-service";
import EntityMapper from "../domain-entities/entity-mapper";
import {WikiFolder} from "../domain-entities/wiki-folder";

@injectable()
export class WikiPageService {

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.ArticleFactory)
	articleFactory: ArticleFactory;
	@inject(INJECTABLE_TYPES.ItemFactory)
	itemFactory: ItemFactory;
	@inject(INJECTABLE_TYPES.MonsterFactory)
	monsterFactory: MonsterFactory;
	@inject(INJECTABLE_TYPES.PersonFactory)
	personFactory: PersonFactory;
	@inject(INJECTABLE_TYPES.PlaceFactory)
	placeFactory: PlaceFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	@inject(INJECTABLE_TYPES.EntityMapper)
	entityMapper: EntityMapper;

	createWiki = async (context: SecurityContext, name: string, folderId: string, unitOfWork: UnitOfWork): Promise<WikiFolder> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		if (!(await folder.authorizationPolicy.canCreate(context, unitOfWork))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const newPage = this.articleFactory({_id: null, name, world: folder.world, coverImage: null, contentId: null});
		await unitOfWork.articleRepository.create(newPage);
		folder.pages.push(newPage._id);
		await unitOfWork.wikiFolderRepository.update(folder);

		const readPermission = this.permissionAssignmentFactory({_id: null, permission: WIKI_RW, subject: newPage._id, subjectType: ARTICLE});
		await unitOfWork.permissionAssignmentRepository.create(readPermission);
		context.user.permissions.push(readPermission._id);
		context.permissions.push(readPermission);
		const adminPermission = this.permissionAssignmentFactory(
			{
				_id: null,
				permission: WIKI_ADMIN,
				subject: newPage._id,
				subjectType: ARTICLE
			}
		);
		await unitOfWork.permissionAssignmentRepository.create(adminPermission);
		context.user.permissions.push(adminPermission._id);
		context.permissions.push(adminPermission);
		await unitOfWork.userRepository.update(context.user);
		return folder;
	};

	updateWiki = async (
		context: SecurityContext,
		wikiId: string,
		unitOfWork: UnitOfWork,
		readStream?: Readable,
		name?: string,
		coverImageId?: string,
		type?: string
	): Promise<WikiPage> => {
		let wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error("You do not have permission to write to this page");
		}

		if (readStream) {
			let contentFile = await unitOfWork.fileRepository.findById(wikiPage.contentId);

			if (contentFile) {
				await unitOfWork.fileRepository.delete(contentFile);
			}

			contentFile = this.fileFactory(
				{
					_id: null,
					filename: `wikiContent.${wikiPage._id}.json`,
					readStream: readStream,
					mimeType: "application/json"
				}
			);
			await unitOfWork.fileRepository.create(contentFile);
			wikiPage.contentId = contentFile._id.toString();

		}

		if (name) {
			wikiPage.name = name;
		}

		if (coverImageId) {
			const image = await unitOfWork.imageRepository.findById(coverImageId);
			if (!image) {
				throw new Error(`No image exists with id ${coverImageId}`);
			}
		}
		wikiPage.coverImage = coverImageId;

		if (type && type !== wikiPage.type) {
			// update old permissions to have the right subject type
			const currentPermissions = await unitOfWork.permissionAssignmentRepository.find([new FilterCondition('subject', wikiPage._id)]);
			for (const oldPermission of currentPermissions) {
				oldPermission.subjectType = type;
				await unitOfWork.permissionAssignmentRepository.update(oldPermission);
			}
			// recreate the wiki page with the right default values
			const newType = this.entityMapper.map(type);
			wikiPage = newType.factory(wikiPage) as WikiPage;
		}

		await unitOfWork.wikiPageRepository.update(wikiPage);
		return wikiPage;
	};

	deleteWiki = async (context: SecurityContext, wikiId: string, unitOfWork: UnitOfWork): Promise<WikiFolder> => {
		const wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error("Page does not exist");
		}

		if (!(await wikiPage.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error("You do not have permission to write to this page");
		}

		const world = await unitOfWork.worldRepository.findOne([
			new FilterCondition("wikiPage", wikiId),
		]);
		if (world) {
			throw new Error("You cannot delete the main page of a world");
		}

		const parentFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", wikiPage._id),
		]);

		if (parentFolder) {
			parentFolder.pages = parentFolder.pages.filter((page) => page !== wikiPage._id);
			await unitOfWork.wikiFolderRepository.update(parentFolder);
		}

		await this.authorizationService.cleanUpPermissions(wikiPage._id, unitOfWork);
		await unitOfWork.wikiPageRepository.delete(wikiPage);
		return parentFolder;
	};

	updatePlace = async (
		context: SecurityContext,
		placeId: string,
		pixelsPerFoot: number,
		unitOfWork: UnitOfWork,
		mapImageId?: string
	) => {
		const place = await unitOfWork.placeRepository.findById(placeId);
		if (!place) {
			throw new Error(`Place ${placeId} does not exist`);
		}

		if (!(await place.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission to write to this page`);
		}

		if (mapImageId) {
			const image = await unitOfWork.imageRepository.findById(mapImageId);
			if (!image) {
				throw new Error(`Image with id ${mapImageId} does not exist`);
			}
		}

		place.mapImage = mapImageId;
		place.pixelsPerFoot = pixelsPerFoot;
		await unitOfWork.placeRepository.update(place);
		return place;
	};

	updateModeledWiki = async (
		context: SecurityContext,
		wikiId: string,
		model: string,
		color: string,
		unitOfWork: UnitOfWork
	) => {
		let wikiPage: ModeledPage = await unitOfWork.wikiPageRepository.findById(wikiId) as ModeledPage;
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error("You do not have permission to write to this page");
		}
		const foundModel = await unitOfWork.modelRepository.findById(model);
		if (model && !foundModel) {
			throw new Error(`Model ${model} does not exist`);
		}
		wikiPage.pageModel = model;
		wikiPage.modelColor = color;
		await wikiPage.getRepository(unitOfWork).update(wikiPage);
		return wikiPage;
	};

	moveWiki = async (context: SecurityContext, wikiId: string, folderId: string, unitOfWork: UnitOfWork): Promise<WikiPage> => {
		const wikiPage = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error("You do not have permission to write to this page");
		}

		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const oldFolder = await unitOfWork.wikiFolderRepository.findOne([
			new FilterCondition("pages", wikiId),
		]);
		if (oldFolder && !(await oldFolder.authorizationPolicy.canWrite(context, unitOfWork))) {
			throw new Error(`You do not have permission to write to the folder ${oldFolder._id}`);
		}

		folder.pages.push(wikiPage._id);
		await unitOfWork.wikiFolderRepository.update(folder);
		oldFolder.pages = oldFolder.pages.filter((pageId) => pageId !== wikiPage._id);
		await unitOfWork.wikiFolderRepository.update(oldFolder);
		return wikiPage;
	};

	getWiki = async (context: SecurityContext, wikiId: string, unitOfWork: UnitOfWork): Promise<WikiPage> => {
		let foundWiki = await unitOfWork.wikiPageRepository.findById(wikiId);
		if (foundWiki && !(await foundWiki.authorizationPolicy.canRead(context, unitOfWork))) {
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}

		foundWiki = (await foundWiki.getRepository(unitOfWork).findById(foundWiki._id)) as WikiPage;

		return foundWiki;
	};

	searchWikis = async (context: SecurityContext, worldId: string, name: string, types: string[], canAdmin: boolean, page: number, unitOfWork: UnitOfWork): Promise<PaginatedResult<WikiPage>>  => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, unitOfWork))) {
			throw new Error("You do not have permission to read this World");
		}

		const conditions = [];
		if(name ) {
			conditions.push(new FilterCondition('name', name, FILTER_CONDITION_REGEX));
		}
		if(types && types.length > 0){
			conditions.push(new FilterCondition('type', types, FILTER_CONDITION_OPERATOR_IN));
		}
		const results = await unitOfWork.wikiPageRepository.findPaginated(conditions, page);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await doc.authorizationPolicy.canAdmin(context))) {
				continue;
			}
			if (await doc.authorizationPolicy.canRead(context, unitOfWork)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	}

	getWikisInFolder = async (
		context: SecurityContext,
		folderId: string,
		page: number,
		unitOfWork: UnitOfWork
	): Promise<PaginatedResult<WikiPage>> => {
		const folder = await unitOfWork.wikiFolderRepository.findById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canRead(context, unitOfWork))) {
			throw new Error("You do not have permission to read this folder");
		}
		const results = await unitOfWork.wikiPageRepository.findPaginated(
			[new FilterCondition("_id", folder.pages, FILTER_CONDITION_OPERATOR_IN)],
			page,
			"name"
		);
		const docs = [];
		for (let doc of results.docs) {
			if (await doc.authorizationPolicy.canRead(context, unitOfWork)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	};
}
