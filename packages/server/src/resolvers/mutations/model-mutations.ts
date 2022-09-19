import { SessionContext } from "../../types";
import { FileUpload } from "graphql-upload";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {ModelService} from "../../services/model-service";

export const modelMutations = {
	createModel: async (
		_: any,
		{
			name,
			file,
			worldId,
			depth,
			width,
			height,
			notes,
		}: {
			name: string;
			file: FileUpload;
			worldId: string;
			depth: number;
			width: number;
			height: number;
			notes: string;
		},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const modelService = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return await modelService.createModel(
			securityContext,
			worldId,
			name,
			file,
			depth,
			width,
			height,
			notes,
			databaseContext
		);
	},
	updateModel: async (
		_: any,
		{
			modelId,
			name,
			file,
			depth,
			width,
			height,
			notes,
		}: {
			modelId: string;
			name: string;
			file: FileUpload;
			depth: number;
			width: number;
			height: number;
			notes: string;
		},
		{ securityContext, databaseContext }: SessionContext
	) => {
		const modelService = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return await modelService.updateModel(
			securityContext,
			modelId,
			name,
			depth,
			width,
			height,
			notes,
			databaseContext,
			file
		);
	},
	deleteModel: async (
		_: any,
		{ modelId }: { modelId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const modelService = container.get<ModelService>(INJECTABLE_TYPES.ModelService);
		return await modelService.deleteModel(securityContext, modelId, databaseContext);
	},
};
