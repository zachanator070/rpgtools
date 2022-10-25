import {
	Cache,
	EventPublisher,
} from "../types";
import { MODEL_ADMIN, MODEL_RW } from "@rpgtools/common/src/permission-constants";
import {USER} from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { SecurityContext } from "../security/security-context";
import { FileUpload } from "graphql-upload";
import { Model } from "../domain-entities/model";
import { GAME_MODEL_DELETED } from "../resolvers/subscription-resolvers";
import {AuthorizationService} from "./authorization-service";
import {DatabaseContext} from "../dal/database-context";
import FileFactory from "../domain-entities/factory/file-factory";
import ModelFactory from "../domain-entities/factory/model-factory";

@injectable()
export class ModelService {
	@inject(INJECTABLE_TYPES.Cache)
	cache: Cache;

	@inject(INJECTABLE_TYPES.EventPublisher)
	eventPublisher: EventPublisher;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;
	@inject(INJECTABLE_TYPES.ModelFactory)
	modelFactory: ModelFactory;

	updateModel = async (
		context: SecurityContext,
		modelId: string,
		name: string,
		depth: number,
		width: number,
		height: number,
		notes: string,
		databaseContext: DatabaseContext,
		file?: FileUpload
	) => {
		const model = await databaseContext.modelRepository.findOneById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await model.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to edit this model");
		}
		if (file) {
			if (await this.cache.exists(model.fileName)) {
				await this.cache.delete(model.fileName);
			}

			if (model.fileId) {
				const file = await databaseContext.fileRepository.findOneById(model.fileId);
				await databaseContext.fileRepository.delete(file);
			}
			file = await file;

			const newFile = this.fileFactory.build({filename: file.filename, readStream: file.createReadStream(), mimeType: null});
			await databaseContext.fileRepository.create(newFile);
			model.fileId = newFile._id;
			model.fileName = file.filename;
		}
		model.name = name;
		model.depth = depth;
		model.width = width;
		model.height = height;
		model.notes = notes;
		await databaseContext.modelRepository.update(model);
		return model;
	};

	createModel = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		fileUpload: FileUpload,
		depth: number,
		width: number,
		height: number,
		notes: string,
		databaseContext: DatabaseContext
	) => {
		const world = await databaseContext.worldRepository.findOneById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		const model = this.modelFactory.build(
			{
				world: worldId,
				name,
				depth,
				width,
				height,
				fileName: null,
				fileId: null,
				notes,
				acl: []
			}
		);

		if (!(await model.authorizationPolicy.canCreate(context, databaseContext))) {
			throw new Error("You do not have permission to add models to this world");
		}

		fileUpload = await fileUpload;

		model.fileName = fileUpload.filename;
		const file = this.fileFactory.build({filename: fileUpload.filename, readStream: fileUpload.createReadStream(), mimeType: null});
		await databaseContext.fileRepository.create(file);
		model.fileId = file._id;
		await databaseContext.modelRepository.create(model);
		for (let permission of [MODEL_RW, MODEL_ADMIN]) {
			model.acl.push({
				permission,
				principal: context.user._id,
				principalType: USER
			});
		}
		await databaseContext.userRepository.update(context.user);
		await databaseContext.modelRepository.update(model);
		return model;
	};

	deleteModel = async (context: SecurityContext, modelId: string, databaseContext: DatabaseContext) => {
		const model = await databaseContext.modelRepository.findOneById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await model.authorizationPolicy.canWrite(context, databaseContext))) {
			throw new Error("You do not have permission to delete this model");
		}
		const games = await databaseContext.gameRepository.findWithModel(modelId);
		for (let game of games) {
			const positionedModel = game.models.find((otherModel) => otherModel.model === model._id);
			game.models = game.models.filter((positionedModel) => positionedModel.model !== model._id);
			await databaseContext.gameRepository.update(game);
			await this.eventPublisher.publish(GAME_MODEL_DELETED, {
				gameId: game._id.toString(),
				gameModelDeleted: positionedModel,
			});
		}
		await databaseContext.modelRepository.delete(model);
		if (await this.cache.exists(model.fileName)) {
			await this.cache.delete(model.fileName);
		}
		return model;
	};

	getModels = async (context: SecurityContext, worldId: string, databaseContext: DatabaseContext): Promise<Model[]> => {
		const models = await databaseContext.modelRepository.findByWorld(worldId);
		const returnModels = [];
		for (let model of models) {
			if (await model.authorizationPolicy.canRead(context, databaseContext)) {
				returnModels.push(model);
			}
		}
		return returnModels;
	};
}
