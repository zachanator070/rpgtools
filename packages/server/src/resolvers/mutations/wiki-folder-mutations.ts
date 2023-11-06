import { SessionContext } from "../../types";
import { FileUpload } from "graphql-upload";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {ContentImportService} from "../../services/content-import-service";
import {WikiFolderService} from "../../services/wiki-folder-service";

export const wikiFolderMutations = {
	createFolder: async (
		_: any,
		{ name, parentFolderId }: { name: string; parentFolderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.createFolder(securityContext, name, parentFolderId, databaseContext);
	},
	renameFolder: async (
		_: any,
		{ folderId, name }: { folderId: string; name: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.renameFolder(securityContext, folderId, name, databaseContext);
	},
	deleteFolder: async (
		_: any,
		{ folderId }: { folderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.deleteFolder(securityContext, folderId, databaseContext);
	},
	moveFolder: async (
		_: any,
		{ folderId, parentFolderId }: { folderId: string; parentFolderId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.moveFolder(securityContext, folderId, parentFolderId, databaseContext);
	},
	importContent: async (
		_: any,
		{ folderId, zipFile }: { folderId: string; zipFile: FileUpload },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const importContentService = container.get<ContentImportService>(
			INJECTABLE_TYPES.ContentImportService
		);
		await zipFile;
		return await importContentService.importContent(securityContext, folderId, zipFile.createReadStream(), databaseContext);
	},
};
