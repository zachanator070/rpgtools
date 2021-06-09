import { FileUpload } from "graphql-upload";
import { ImageService, SessionContext } from "../../types";
import { container } from "../../inversify.config";
import { INJECTABLE_TYPES } from "../../injectable-types";

export const imageMutations = {
	createImage: async (
		_: any,
		{ file, worldId, chunkify }: { file: FileUpload; worldId: string; chunkify: boolean },
		{ securityContext }: SessionContext
	) => {
		file = await file;
		const stream = file.createReadStream();
		const imageService = container.get<ImageService>(INJECTABLE_TYPES.ImageService);
		return imageService.createImage(worldId, chunkify, file.filename, stream);
	},
};
