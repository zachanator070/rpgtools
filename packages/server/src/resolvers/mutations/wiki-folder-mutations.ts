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
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.createFolder(securityContext, name, parentFolderId, unitOfWork);
	},
	renameFolder: async (
		_: any,
		{ folderId, name }: { folderId: string; name: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.renameFolder(securityContext, folderId, name, unitOfWork);
	},
	deleteFolder: async (
		_: any,
		{ folderId }: { folderId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.deleteFolder(securityContext, folderId, unitOfWork);
	},
	moveFolder: async (
		_: any,
		{ folderId, parentFolderId }: { folderId: string; parentFolderId: string },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
		return await wikiFolderService.moveFolder(securityContext, folderId, parentFolderId, unitOfWork);
	},
	importContent: async (
		_: any,
		{ folderId, zipFile }: { folderId: string; zipFile: FileUpload },
		{ securityContext, unitOfWork }: SessionContext
	) => {
		const importContentService = container.get<ContentImportService>(
			INJECTABLE_TYPES.ContentImportService
		);
		return await importContentService.importContent(securityContext, folderId, zipFile, unitOfWork);
	},
};
