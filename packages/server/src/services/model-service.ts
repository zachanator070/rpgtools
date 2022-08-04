import {
	Cache,
	EventPublisher,
	FileFactory,
	ModelFactory,
	PermissionAssignmentFactory, UnitOfWork,
} from "../types";
import { MODEL_ADMIN, MODEL_RW } from "@rpgtools/common/src/permission-constants";
import { MODEL } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { SecurityContext } from "../security/security-context";
import { FileUpload } from "graphql-upload";
import { Model } from "../domain-entities/model";
import { FilterCondition } from "../dal/filter-condition";
import { GAME_MODEL_DELETED } from "../resolvers/subscription-resolvers";
import {AuthorizationService} from "./authorization-service";

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
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	updateModel = async (
		context: SecurityContext,
		modelId: string,
		name: string,
		depth: number,
		width: number,
		height: number,
		notes: string,
		unitOfWork: UnitOfWork,
		file?: FileUpload
	) => {
		const model = await unitOfWork.modelRepository.findById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await model.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to edit this model");
		}
		if (file) {
			if (await this.cache.exists(model.fileName)) {
				await this.cache.delete(model.fileName);
			}

			if (model.fileId) {
				const file = await unitOfWork.fileRepository.findById(model.fileId);
				await unitOfWork.fileRepository.delete(file);
			}
			file = await file;

			const newFile = this.fileFactory({_id: null, filename: file.filename, readStream: file.createReadStream(), mimeType: null});
			await unitOfWork.fileRepository.create(newFile);
			model.fileId = newFile._id;
			model.fileName = file.filename;
		}
		model.name = name;
		model.depth = depth;
		model.width = width;
		model.height = height;
		model.notes = notes;
		await unitOfWork.modelRepository.update(model);
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
		unitOfWork: UnitOfWork
	) => {
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		const model = this.modelFactory(
			{
				_id: null,
				world: worldId,
				name,
				depth,
				width,
				height,
				fileName: null,
				fileId: null,
				notes
			}
		);

		if (!(await model.authorizationPolicy.canCreate(context))) {
			throw new Error("You do not have permission to add models to this world");
		}

		fileUpload = await fileUpload;

		const file = this.fileFactory({_id: null, filename: fileUpload.filename, readStream: fileUpload.createReadStream(), mimeType: null});
		await unitOfWork.fileRepository.create(file);
		await unitOfWork.modelRepository.create(model);
		for (let permission of [MODEL_RW, MODEL_ADMIN]) {
			const permissionAssignment = this.permissionAssignmentFactory(
				{
					_id: null,
					permission,
					subject: model._id,
					subjectType: MODEL
				}
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		await unitOfWork.userRepository.update(context.user);
		return model;
	};

	deleteModel = async (context: SecurityContext, modelId: string, unitOfWork: UnitOfWork) => {
		const model = await unitOfWork.modelRepository.findById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await model.authorizationPolicy.canWrite(context))) {
			throw new Error("You do not have permission to delete this model");
		}
		const games = await unitOfWork.gameRepository.find([new FilterCondition("models", {_id: modelId})]);
		for (let game of games) {
			const positionedModel = game.models.find((otherModel) => otherModel.model === model._id);
			game.models = game.models.filter((positionedModel) => positionedModel.model !== model._id);
			await unitOfWork.gameRepository.update(game);
			await this.eventPublisher.publish(GAME_MODEL_DELETED, {
				gameId: game._id.toString(),
				gameModelDeleted: positionedModel,
			});
		}
		await unitOfWork.modelRepository.delete(model);
		if (await this.cache.exists(model.fileName)) {
			await this.cache.delete(model.fileName);
		}
		await this.authorizationService.cleanUpPermissions(modelId, unitOfWork);
		return model;
	};

	getModels = async (context: SecurityContext, worldId: string, unitOfWork: UnitOfWork): Promise<Model[]> => {
		const models = await unitOfWork.modelRepository.find([new FilterCondition("world", worldId)]);
		const returnModels = [];
		for (let model of models) {
			if (await model.authorizationPolicy.canRead(context)) {
				returnModels.push(model);
			}
		}
		return returnModels;
	};

	private filenameExists = async (filename: string, unitOfWork: UnitOfWork) => {
		const models = await unitOfWork.modelRepository.find([
			new FilterCondition("filename", filename),
		]);
		return models.length > 1;
	};
}
