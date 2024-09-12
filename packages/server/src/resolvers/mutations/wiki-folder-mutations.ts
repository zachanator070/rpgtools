import { SessionContext } from "../../types";
import { FileUpload } from "graphql-upload";
import { container } from "../../di/inversify.js";
import { INJECTABLE_TYPES } from "../../di/injectable-types.js";
import {ContentImportService} from "../../services/content-import-service.js";
import {WikiFolderService} from "../../services/wiki-folder-service.js";

export const wikiFolderMutations = {
	createFolder: async (
		_: any,
		{ name, parentFolderId }: { name: string; parentFolderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await databaseContext.openTransaction(async () => wikiFolderService.createFolder(securityContext, name, parentFolderId, databaseContext));
	},
	renameFolder: async (
		_: any,
		{ folderId, name }: { folderId: string; name: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await databaseContext.openTransaction(async () => wikiFolderService.renameFolder(securityContext, folderId, name, databaseContext));
	},
	deleteFolder: async (
		_: any,
		{ folderId }: { folderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await databaseContext.openTransaction(async () => wikiFolderService.deleteFolder(securityContext, folderId, databaseContext));
	},
	moveFolder: async (
		_: any,
		{ folderId, parentFolderId }: { folderId: string; parentFolderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await databaseContext.openTransaction(async () => wikiFolderService.moveFolder(securityContext, folderId, parentFolderId, databaseContext));
	},
	importContent: async (
		_: any,
		{ folderId, zipFile }: { folderId: string; zipFile: FileUpload },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const importContentService = container.get<ContentImportService>(
			INJECTABLE_TYPES.ContentImportService
		);
		const file = await zipFile;
		return await databaseContext.openTransaction(async () => importContentService.importContent(securityContext, folderId, file.createReadStream(), databaseContext));
	},
};
