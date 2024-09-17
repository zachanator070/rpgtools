import { inject, injectable } from "inversify";
import { SecurityContext } from "../security/security-context.js";
import {USER} from "@rpgtools/common/src/type-constants.js";
import { WIKI_ADMIN, WIKI_RW } from "@rpgtools/common/src/permission-constants.js";
import { Readable } from "stream";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import { ModeledPage } from "../domain-entities/modeled-page.js";
import { WikiPage } from "../domain-entities/wiki-page.js";
import { PaginatedResult } from "../dal/paginated-result.js";
import {AuthorizationService} from "./authorization-service.js";
import EntityMapper from "../domain-entities/entity-mapper.js";
import {WikiFolder} from "../domain-entities/wiki-folder.js";
import {DatabaseContext} from "../dal/database-context.js";
import ArticleFactory from "../domain-entities/factory/article-factory.js";
import ItemFactory from "../domain-entities/factory/item-factory.js";
import MonsterFactory from "../domain-entities/factory/monster-factory.js";
import PersonFactory from "../domain-entities/factory/person-factory.js";
import PlaceFactory from "../domain-entities/factory/place-factory.js";
import FileFactory from "../domain-entities/factory/file-factory.js";
import stream from "stream";

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

	createWiki = async (context: SecurityContext, name: string, folderId: string, databaseContext: DatabaseContext): Promise<WikiPage> => {
		const folder = await databaseContext.wikiFolderRepository.findOneById(folderId);
		if (!folder) {
			throw new Error("Folder does not exist");
		}

		if (!(await folder.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error(`You do not have permission to write to the folder ${folderId}`);
		}

		const newPage = this.articleFactory.build({name, world: folder.world, coverImage: null, contentId: null, acl: [], relatedWikis: []});
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

		await databaseContext.articleRepository.update(newPage);
		return newPage;
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
			const relatedWikis: Set<string> = new Set();
			let contentFile = await databaseContext.fileRepository.findOneById(wikiPage.contentId);

			if (contentFile) {
				await databaseContext.fileRepository.delete(contentFile);
			}

			const searchingStream = new stream.PassThrough();
			const chunks: Buffer[] = [];
			const matchChunks = () => {
				const current = Buffer.concat(chunks).toString('utf8');
				const matches = current.matchAll(/\/ui\/world\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/wiki\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\/view/g);
				if(matches) {
					for(const match of matches) {
						relatedWikis.add(match[1]);
					}
				}
			}
			searchingStream.on('data', (chunk) => {
				chunks.push(Buffer.from(chunk));
				matchChunks();
				if(chunks.length > 3) {
					chunks.shift();
				}
			});
			searchingStream.on('end', async () => {
				matchChunks();
				wikiPage.relatedWikis = [...relatedWikis];
			});
			const finalSteam = new stream.PassThrough();
			searchingStream.pipe(finalSteam);
			readStream.pipe(searchingStream);

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
		await wikiPage.getRepository(databaseContext).update(wikiPage);
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

		const repo = await this.entityMapper.map(wikiPage.type).getRepository(databaseContext);
		await repo.delete(wikiPage);
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
		const wikiPage: ModeledPage = await databaseContext.wikiPageRepository.findOneById(wikiId) as ModeledPage;
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

	updateEventWiki = async (
		context: SecurityContext,
		wikiId: string,
		calendarId: string,
		age: number,
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second: number,
		databaseContext: DatabaseContext
	) => {
		const wikiPage = await databaseContext.eventRepository.findOneById(wikiId);
		if (!wikiPage) {
			throw new Error(`Wiki ${wikiId} does not exist`);
		}
		if (!(await wikiPage.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to write to this page");
		}
		if(calendarId) {
			const calendar = await databaseContext.calendarRepository.findOneById(calendarId);
			if(!calendar) {
				throw new Error(`Calendar with id ${calendarId} not found`);
			}
			wikiPage.calendar = calendarId;
			if(age - 1 >= calendar.ages.length) {
				throw new Error(`Calendar ${calendarId} only has ${calendar.ages.length} ages.`)
			}
			if(age <= 0) {
				throw new Error(`Age cannot be negative`)
			}
			wikiPage.age = age;
			const ageEntity = calendar.ages[age - 1];
			if(year > ageEntity.numYears) {
				throw new Error(`Age ${ageEntity._id} only has ${ageEntity.numYears} years`);
			}
			if(year <= 0) {
				throw new Error(`Year must be greater than 0`);
			}
			wikiPage.year = year;
			if(month - 1 >= ageEntity.months.length) {
				throw new Error(`Age ${ageEntity._id} only has ${ageEntity.months.length} months`);
			}
			if(month <= 0) {
				throw new Error(`Month must be greater than 0`);
			}
			wikiPage.month = month;
			const monthEntity = ageEntity.months[month - 1];
			if(day > monthEntity.numDays) {
				throw new Error(`Month ${monthEntity._id} only has ${monthEntity.numDays}`);
			}
			if(day <= 0) {
				throw new Error(`Day must be greater than 0`);
			}
			wikiPage.day = day;
		}
		if(hour < 0 || hour > 23) {
			throw new Error('Hour must be between 0 and 23');
		}
		wikiPage.hour = hour;
		if(minute < 0 || minute > 59) {
			throw new Error('Minute must be between 0 and 59');
		}
		wikiPage.minute = minute;
		if(second < 0 || second > 59) {
			throw new Error('Second must be between 0 and 59');
		}
		wikiPage.second = second;
		await databaseContext.eventRepository.update(wikiPage);
		return wikiPage;
	}

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

	searchWikis = async (context: SecurityContext, worldId: string, name: string, types: string[], canAdmin: boolean, hasModel: boolean, page: number = 1, databaseContext: DatabaseContext): Promise<PaginatedResult<WikiPage>>  => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(context, databaseContext))) {
			throw new Error("You do not have permission to read this World");
		}

		if(!types) {
			types = [];
		}

		const results = await databaseContext.wikiPageRepository.findByNameAndTypesPaginatedSortByName(page, name, types);

		const docs = [];
		for (const doc of results.docs) {
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
		for (const doc of results.docs) {
			if (await doc.authorizationPolicy.canRead(context, databaseContext)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
	};

    async getEvents(worldId: string, securityContext: SecurityContext, databaseContext: DatabaseContext, relatedWikiIds?: string[], calendarIds?: string[], page: number = 1) : Promise<PaginatedResult<WikiPage>> {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error("World does not exist");
		}
		if (!(await world.authorizationPolicy.canRead(securityContext, databaseContext))) {
			throw new Error("You do not have permission to read this World");
		}

		const results = await databaseContext.eventRepository.findByWorldAndContentAndCalendar(
			page,
			worldId,
			relatedWikiIds,
			calendarIds
		);
		const docs = [];
		for (const doc of results.docs) {
			if (await doc.authorizationPolicy.canRead(securityContext, databaseContext)) {
				docs.push(doc);
			}
		}
		results.docs = docs;
		return results;
    }
}
