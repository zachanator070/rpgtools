import { SessionContext } from "../../types";
import { FileUpload } from "graphql-upload";

export const folderMutations = {
	createFolder: async (
		_: any,
		{ name, parentFolderId }: { name: string; parentFolderId: string },
		{ securityContext, wikiFolderService }: SessionContext
	) => {
		return await wikiFolderService.createFolder(securityContext, name, parentFolderId);
	},
	renameFolder: async (
		_: any,
		{ folderId, name }: { folderId: string; name: string },
		{ securityContext, wikiFolderService }: SessionContext
	) => {
		return await wikiFolderService.renameFolder(securityContext, folderId, name);
	},
	deleteFolder: async (
		_: any,
		{ folderId }: { folderId: string },
		{ securityContext, wikiFolderService }: SessionContext
	) => {
		return await wikiFolderService.deleteFolder(securityContext, folderId);
	},
	moveFolder: async (
		_: any,
		{ folderId, parentFolderId }: { folderId: string; parentFolderId: string },
		{ securityContext, wikiFolderService }: SessionContext
	) => {
		return await wikiFolderService.moveFolder(securityContext, folderId, parentFolderId);
	},
	importContent: async (
		_: any,
		{ folderId, zipFile }: { folderId: string; zipFile: FileUpload },
		{ securityContext, wikiFolderService }: SessionContext
	) => {},
};
