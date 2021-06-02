import { GameModel } from "../../dal/mongodb/models/game";
import { GAME_MODEL_DELETED } from "../subscription-resolvers";
import { SessionContext } from "../../types";
import { FileUpload } from "graphql-upload";

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
		{ securityContext, modelService }: SessionContext
	) => {
		return await modelService.createModel(
			securityContext,
			worldId,
			name,
			file,
			depth,
			width,
			height,
			notes
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
		{ modelService, securityContext }: SessionContext
	) => {
		return await modelService.updateModel(
			securityContext,
			modelId,
			name,
			depth,
			width,
			height,
			notes,
			file
		);
	},
	deleteModel: async (_, { modelId }, { currentUser }) => {
		const model = await Model.findById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await model.userCanWrite(currentUser))) {
			throw new Error("You do not have permission to delete this model");
		}
		const games = await GameModel.find({ "models.model": model._id });
		for (let game of games) {
			const positionedModel = game.models.find((otherModel) => otherModel.model.equals(model._id));
			game.models = game.models.filter(
				(positionedModel) => !positionedModel.model.equals(model._id)
			);
			await game.save();
			await pubsub.publish(GAME_MODEL_DELETED, {
				gameId: game._id.toString(),
				gameModelDeleted: positionedModel.toObject(),
			});
		}
		await Model.deleteOne({ _id: modelId });
		if (await existsAsync(model.fileName)) {
			await delAsync(model.fileName);
		}
		await cleanUpPermissions(modelId);
		return model;
	},
};
