import { SessionContext, WikiPageService } from "../../types";
import { container } from "../../inversify.config";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { FileUpload } from "graphql-upload";

export const wikiMutations = {
	createWiki: async (
		_: any,
		{ name, folderId }: { name: string; folderId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.createWiki(securityContext, name, folderId);
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
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		content = await content;
		return await service.updateWiki(
			securityContext,
			wikiId,
			content && content.createReadStream(),
			name,
			coverImageId,
			type
		);
	},
	deleteWiki: async (
		_: any,
		{ wikiId }: { wikiId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.deleteWiki(securityContext, wikiId);
	},
	updatePlace: async (
		_: any,
		{
			placeId,
			mapImageId,
			pixelsPerFoot,
		}: { placeId: string; mapImageId: string; pixelsPerFoot: number },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.updatePlace(securityContext, placeId, pixelsPerFoot, mapImageId);
	},
	updateModeledWiki: async (
		_: any,
		{ wikiId, model, color }: { wikiId: string; model: string; color: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.updateModeledWiki(securityContext, wikiId, model, color);
	},
	moveWiki: async (
		_: any,
		{ wikiId, folderId }: { wikiId: string; folderId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);
		return await service.moveWiki(securityContext, wikiId, folderId);
	},
};
