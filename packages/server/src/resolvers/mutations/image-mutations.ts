import { FileUpload } from "graphql-upload";
import { SessionContext } from "../../types";

export const imageMutations = {
	createImage: async (
		_: any,
		{ file, worldId, chunkify }: { file: FileUpload; worldId: string; chunkify: boolean },
		{ imageService }: SessionContext
	) => {
		return imageService.createImage(worldId, chunkify, file);
	},
};
