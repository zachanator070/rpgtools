import { FileUpload } from "graphql-upload";
import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {ImageService} from "../../services/image-service";

export const imageMutations = {
	createImage: async (
		_: any,
		{ file, worldId, chunkify }: { file: FileUpload; worldId: string; chunkify: boolean },
		{ databaseContext }: SessionContext
	) => {
		file = await file;
		const stream = file.createReadStream();
		const imageService = container.get<ImageService>(INJECTABLE_TYPES.ImageService);
		return await databaseContext.openTransaction(async () => imageService.createImage(worldId, chunkify, file.filename, stream, databaseContext));
	},
};
