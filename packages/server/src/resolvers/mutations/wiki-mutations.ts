import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FileUpload } from "graphql-upload";
import {WikiPageService} from "../../services/wiki-page-service";

export const wikiMutations = {
	createWiki: async (
		_: any,
		{ name, folderId }: { name: string; folderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.createWiki(securityContext, name, folderId, databaseContext));
	},
	updateWiki: async (
		_: any,
		{
			wikiId,
			name,
			content,
			coverImageId,
			type,
		}: { wikiId: string; name: string; content: FileUpload; coverImageId: string; type: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		content = await content;
		return await databaseContext.openTransaction(async () => service.updateWiki(
			securityContext,
			wikiId,
			databaseContext,
			content && content.createReadStream(),
			name,
			coverImageId,
			type
		));
	},
	deleteWiki: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.deleteWiki(securityContext, wikiId, databaseContext));
	},
	updatePlace: async (
		_: any,
		{
			placeId,
			mapImageId,
			pixelsPerFoot,
		}: { placeId: string; mapImageId: string; pixelsPerFoot: number },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.updatePlace(securityContext, placeId, pixelsPerFoot, databaseContext, mapImageId));
	},
	updateModeledWiki: async (
		_: any,
		{ wikiId, model, color }: { wikiId: string; model: string; color: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.updateModeledWiki(securityContext, wikiId, model, color, databaseContext));
	},
	updateEventWiki: async(
		_: any,
		{
			wikiId,
			calendarId,
			age,
			year,
			month,
			day,
			hour,
			minute,
			second,
		}:{
			wikiId: string,
			calendarId: string,
			age: number,
			year: number,
			month: number,
			day: number,
			hour: number,
			minute: number,
			second: number,
		},
		{securityContext, databaseContext}: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.updateEventWiki(securityContext, wikiId, calendarId, age, year, month, day, hour, minute, second, databaseContext));
	},
	moveWiki: async (
		_: any,
		{ wikiId, folderId }: { wikiId: string; folderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await databaseContext.openTransaction(async () => service.moveWiki(securityContext, wikiId, folderId, databaseContext));
	},
};
