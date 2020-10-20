import {World} from "../../models/world";
import {MODEL_ADD, MODEL_ADMIN, MODEL_RW} from "@rpgtools/common/src/permission-constants";
import {Model} from "../../models/model";
import {PermissionAssignment} from "../../models/permission-assignement";
import {MODEL} from "@rpgtools/common/src/type-constants";
import {cleanUpPermissions, createGfsFile, deleteGfsFile} from "../../db-helpers";
import {Game} from "../../models/game";
import {pubsub} from "../../gql-server";
import {GAME_MODEL_DELETED} from "../server-resolvers";
import {delAsync, existsAsync, getAsync, setAsync} from "../../redis-client";

const filenameExists = async (filename) => {
	const models = await Model.find({filename});
	return models.length > 1;
}

export const modelMutations = {
	createModel: async (_, {name, file, worldId, depth, width, height, notes}, {currentUser}) => {
		if(!await currentUser.hasPermission(MODEL_ADD, worldId)){
			throw new Error('You do not have permission to add models to this world');
		}

		const world = await World.findById(worldId);
		if(!world){
			throw new Error(`World with id ${worldId} does not exist`);
		}

		file = await file;
		if(await filenameExists(file.filename)){
			throw new Error(`Filename ${file.filename} already exists, filenames must be unique`);
		}

		const fileId = await createGfsFile(file.filename, file.createReadStream());

		const model = await Model.create({name, fileId, fileName: file.filename, world, depth, width, height, notes});
		for(let permission of [MODEL_RW, MODEL_ADMIN]){
			const permissionAssignment = await PermissionAssignment.create({permission, subject: model, subjectType: MODEL});
			currentUser.permissions.push(permissionAssignment);
		}
		await currentUser.save();
		return model;

	},
	updateModel: async (_, {modelId, name, file, depth, width, height, notes}, {currentUser}) => {
		const model = await Model.findById(modelId);
		if(!model){
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if(!await model.userCanWrite(currentUser)){
			throw new Error('You do not have permission to edit this model');
		}
		if(file){

			if(await existsAsync(model.fileName)){
				await delAsync(model.fileName);
			}

			if(model.fileId){
				await deleteGfsFile(model.fileId);
			}
			file = await file;

			if(await filenameExists(file.filename)){
				throw new Error(`Filename ${file.filename} already exists, filenames must be unique`);
			}

			model.fileId = await createGfsFile(file.filename, file.createReadStream());
			model.fileName = file.filename;
		}
		model.name = name;
		model.depth = depth;
		model.width = width;
		model.height = height;
		model.notes = notes;
		await model.save();
		return model;
	},
	deleteModel: async (_, {modelId}, {currentUser}) => {
		const model = await Model.findById(modelId);
		if(!model){
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if(!await model.userCanWrite(currentUser)){
			throw new Error('You do not have permission to delete this model');
		}
		const games = await Game.find({"models.model": model._id});
		for(let game of games){
			const positionedModel = game.models.find(otherModel => otherModel.model.equals(model._id));
			game.models = game.models.filter((positionedModel) => !positionedModel.model.equals(model._id));
			await game.save();
			await pubsub.publish(GAME_MODEL_DELETED, {gameId: game._id.toString(), gameModelDeleted: positionedModel.toObject()});
		}
		await Model.deleteOne({_id: modelId});
		if(await existsAsync(model.fileName)){
			await delAsync(model.fileName);
		}
		await cleanUpPermissions(modelId);
		return model;
	}
};