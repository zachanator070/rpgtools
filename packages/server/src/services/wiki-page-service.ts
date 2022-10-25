import { inject, injectable } from "inversify";
import { SecurityContext } from "../security/security-context";
import {USER} from "@rpgtools/common/src/type-constants";
import { WIKI_ADMIN, WIKI_RW } from "@rpgtools/common/src/permission-constants";
import { Readable } from "stream";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { ModeledPage } from "../domain-entities/modeled-page";
import { WikiPage } from "../domain-entities/wiki-page";
import { PaginatedResult } from "../dal/paginated-result";
import {AuthorizationService} from "./authorization-service";
import EntityMapper from "../domain-entities/entity-mapper";
import {WikiFolder} from "../domain-entities/wiki-folder";
import {DatabaseContext} from "../dal/database-context";
import ArticleFactory from "../domain-entities/factory/article-factory";
import ItemFactory from "../domain-entities/factory/item-factory";
import MonsterFactory from "../domain-entities/factory/monster-factory";
import PersonFactory from "../domain-entities/factory/person-factory";
import PlaceFactory from "../domain-entities/factory/place-factory";
import FileFactory from "../domain-entities/factory/file-factory";

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
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	@inject(INJECTABLE_TYPES.EntityMapper)
	entityMapper: EntityMapper;

	createWiki = async (context: SecurityContext, name: string, folderId: string, databaseContext: DatabaseContext): Promise<WikiFolder> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const newPage = this.articleFactory.build({name, world: folder.world, coverImage: null, contentId: null, acl: []});
		await databaseContext.articleRepository.create(newPage);
		folder.pages.push(newPage._id);
		await databaseContext.wikiFolderRepository.update(folder);

		newPage.acl.push({
			permission: WIKI_RW,
			principal: context.user._id,
			principalType: USER
		});
		newPage.acl.push({
			permission: WIKI_ADMIN,
			principal: context.user._id,
			principalType: USER
		});

		await databaseContext.userRepository.update(context.user);
		return folder;
	};

	updateWiki = async (
		context: SecurityContext,
		wikiId: string,
		databaseContext: DatabaseContext,
		readStream?: Readable,
		name?: string,
		coverImageId?: string,
		type?: string
	): Promise<WikiPage> => {
		let wikiPage = await databaseContext.wikiPageRepository.findOneById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to write to this page");
		}

		if (readStream) {
			let contentFile = await databaseContext.fileRepository.findOneById(wikiPage.contentId);

			if (contentFile) {
				await databaseContext.fileRepository.delete(contentFile);
			}

			contentFile = this.fileFactory.build(
				{
					filename: `wikiContent.${wikiPage._id}.json`,
					readStream: readStream,
					mimeType: "application/json"
				}
			);
			await databaseContext.fileRepository.create(contentFile);
			wikiPage.contentId = contentFile._id.toString();

		}

		if (name) {
			wikiPage.name = name;
		}

		if (coverImageId) {
			const image = await databaseContext.imageRepository.findOneById(coverImageId);
			if (!image) {
				throw new Error(`No image exists with id ${coverImageId}`);
			}
		}
		wikiPage.coverImage = coverImageId;

		if (type && type !== wikiPage.type) {
			// recreate the wiki page with the right default values
			const newType = this.entityMapper.map(type);
			wikiPage = newType.factory.build(wikiPage) as WikiPage;
		}

		await databaseContext.wikiPageRepository.update(wikiPage);
		return wikiPage;
	};

	deleteWiki = async (context: SecurityContext, wikiId: string, databaseContext: DatabaseContext): Promise<WikiFolder> => {
		const wikiPage = await databaseContext.wikiPageRepository.findOneById(wikiId);
		if (!wikiPage) {
			throw new Error("Page does not exist");
		}

		if (!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to write to this page");
		}

		const world = await databaseContext.worldRepository.findOneByWikiPage(wikiId);
		if (world) {
			throw new Error("You cannot delete the main page of a world");
		}

		const parentFolder = await databaseContext.wikiFolderRepository.findOneWithPage(wikiPage._id);

		if (parentFolder) {
			parentFolder.pages = parentFolder.pages.filter((page) => page !== wikiPage._id);
			await databaseContext.wikiFolderRepository.update(parentFolder);
		}

		await databaseContext.wikiPageRepository.delete(wikiPage);
		return parentFolder;
	};

	updatePlace = async (
		context: SecurityContext,
		placeId: string,
		pixelsPerFoot: number,
		databaseContext: DatabaseContext,
		mapImageId?: string
	) => {
		const place = await databaseContext.placeRepository.findOneById(placeId);
		if (!place) {
			throw new Error(`Place ${placeId} does not exist`);
		}

		if (!(await place.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to write to this page`);
		}

		if (mapImageId) {
			const image = await databaseContext.imageRepository.findOneById(mapImageId);
			if (!image) {
				throw new Error(`Image with id ${mapImageId} does not exist`);
			}
		}

		place.mapImage = mapImageId;
		place.pixelsPerFoot = pixelsPerFoot;
		await databaseContext.placeRepository.update(place);
		return place;
	};

	updateModeledWiki = async (
		context: SecurityContext,
		wikiId: string,
		model: string,
		color: string,
		databaseContext: DatabaseContext
	) => {
		let wikiPage: ModeledPage = await databaseContext.wikiPageRepository.findOneById(wikiId) as ModeledPage;
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to write to this page");
		}
		const foundModel = await databaseContext.modelRepository.findOneById(model);
		if (model && !foundModel) {
			throw new Error(`Model ${model} does not exist`);
		}
		wikiPage.pageModel = model;
		wikiPage.modelColor = color;
		await wikiPage.getRepository(databaseContext).update(wikiPage);
		return wikiPage;
	};

	moveWiki = async (context: SecurityContext, wikiId: string, folderId: string, databaseContext: DatabaseContext): Promise<WikiPage> => {
		const wikiPage = await databaseContext.wikiPageRepository.findOneById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to write to this page");
		}

		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const oldFolder = await databaseContext.wikiFolderRepository.findOneWithPage(wikiId);
		if (oldFolder && !(await oldFolder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to write to the folder ${oldFolder._id}`);
		}

		folder.pages.push(wikiPage._id);
		await databaseContext.wikiFolderRepository.update(folder);
		oldFolder.pages = oldFolder.pages.filter((pageId) => pageId !== wikiPage._id);
		await databaseContext.wikiFolderRepository.update(oldFolder);
		return wikiPage;
	};

	getWiki = async (context: SecurityContext, wikiId: string, databaseContext: DatabaseContext): Promise<WikiPage> => {
		let foundWiki = await databaseContext.wikiPageRepository.findOneById(wikiId);
		if (foundWiki && !(await foundWiki.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error(`You do not have permission to read wiki ${wikiId}`);
		}

		foundWiki = (await foundWiki.getRepository(databaseContext).findOneById(foundWiki._id)) as WikiPage;

		return foundWiki;
	};

	searchWikis = async (context: SecurityContext, worldId: string, name: string, types: string[], canAdmin: boolean, hasModel: boolean, page: number, databaseContext: DatabaseContext): Promise<PaginatedResult<WikiPage>>  => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error("You do not have permission to read this World");
		}

		const results = await databaseContext.wikiPageRepository.findByNameAndTypesPaginated(page, name, types);

		const docs = [];
		for (let doc of results.docs) {
			if (canAdmin !== undefined && !(await doc.authorizationPolicy.canAdmin(context, databaseContext))) {
				continue;
			}
			if (hasModel !== undefined) {
				if (hasModel && !(doc as ModeledPage).pageModel) {
					continue;
				} else if (!hasModel && (doc as ModeledPage).pageModel) {
					continue;
				}
			}
			if (await doc.authorizationPolicy.canRead(context, databaseContext)) {
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
		databaseContext: DatabaseContext
	): Promise<PaginatedResult<WikiPage>> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}
		if (!(await folder.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error("You do not have permission to read this folder");
		}
		const results = await databaseContext.wikiPageRepository.findByIdsPaginated(folder.pages, page,"name");
		const docs = [];
		for (let doc of results.docs) {
			if (await doc.authorizationPolicy.canRead(context, databaseContext)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	};
}
