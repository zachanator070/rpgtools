import { SessionContext } from "../../types.js";
import { container } from "../../di/inversify.js";
import { INJECTABLE_TYPES } from "../../di/injectable-types.js";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import { TokenIconService } from "src/services/token-service.js";

export const tokenIconMutations = {
	createTokenIcon: async (
		_: any,
		{ worldId, imageId, name }: { worldId: string; imageId: string; name?: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const tokenIconService = container.get<TokenIconService>(INJECTABLE_TYPES.TokenIconService);
		return await databaseContext.openTransaction(async () => tokenIconService.createTokenIcon(securityContext, worldId, imageId, name, databaseContext));
	},

	deleteTokenIcon: async (
		_: any,
		{ tokenIconId }: { tokenIconId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const tokenIconService = container.get<TokenIconService>(INJECTABLE_TYPES.TokenIconService);
		return await databaseContext.openTransaction(async () => tokenIconService.deleteTokenIcon(securityContext, tokenIconId, databaseContext));
	},

	bulkCreateTokenIcons: async (
		_: any,
		{ worldId, zipFile }: { worldId: string; zipFile: FileUpload },
		{ securityContext, databaseContext }: SessionContext
	) => {
		zipFile = await zipFile;
		const zipFileReadStream = zipFile.createReadStream();
		const tokenIconService = container.get<TokenIconService>(INJECTABLE_TYPES.TokenIconService);
		return await databaseContext.openTransaction(async () => tokenIconService.bulkCreateTokenIcons(securityContext, worldId, zipFileReadStream, databaseContext));
	},
};
