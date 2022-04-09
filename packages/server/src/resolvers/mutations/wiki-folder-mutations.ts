import { ContentImportService, SessionContext, WikiFolderService } from "../../types";
import { FileUpload } from "graphql-upload";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";

export const wikiFolderMutations = {
	createFolder: async (
		_: any,
		{ name, parentFolderId }: { name: string; parentFolderId: string },
		{ securityContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.createFolder(securityContext, name, parentFolderId);
	},
	renameFolder: async (
		_: any,
		{ folderId, name }: { folderId: string; name: string },
		{ securityContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.renameFolder(securityContext, folderId, name);
	},
	deleteFolder: async (
		_: any,
		{ folderId }: { folderId: string },
		{ securityContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.deleteFolder(securityContext, folderId);
	},
	moveFolder: async (
		_: any,
		{ folderId, parentFolderId }: { folderId: string; parentFolderId: string },
		{ securityContext }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.moveFolder(securityContext, folderId, parentFolderId);
	},
	importContent: async (
		_: any,
		{ folderId, zipFile }: { folderId: string; zipFile: FileUpload },
		{ securityContext }: SessionContext
	) => {
		const importContentService = container.get<ContentImportService>(
			INJECTABLE_TYPES.ContentImportService
		);
		return await importContentService.importContent(securityContext, folderId, zipFile);
	},
};
