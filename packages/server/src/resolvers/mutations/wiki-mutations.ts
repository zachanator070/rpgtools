import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FileUpload } from "graphql-upload";
import {WikiPageService} from "../../services/wiki-page-service";

export const wikiMutations = {
	createWiki: async (
		_: any,
		{ name, folderId }: { name: string; folderId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.createWiki(securityContext, name, folderId, unitOfWork);
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
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		content = await content;
		return await service.updateWiki(
			securityContext,
			wikiId,
			unitOfWork,
			content && content.createReadStream(),
			name,
			coverImageId,
			type
		);
	},
	deleteWiki: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.deleteWiki(securityContext, wikiId, unitOfWork);
	},
	updatePlace: async (
		_: any,
		{
			placeId,
			mapImageId,
			pixelsPerFoot,
		}: { placeId: string; mapImageId: string; pixelsPerFoot: number },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.updatePlace(securityContext, placeId, pixelsPerFoot, unitOfWork, mapImageId);
	},
	updateModeledWiki: async (
		_: any,
		{ wikiId, model, color }: { wikiId: string; model: string; color: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.updateModeledWiki(securityContext, wikiId, model, color, unitOfWork);
	},
	moveWiki: async (
		_: any,
		{ wikiId, folderId }: { wikiId: string; folderId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.moveWiki(securityContext, wikiId, folderId, unitOfWork);
	},
};
