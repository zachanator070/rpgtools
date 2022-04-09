import {
	AuthorizationService,
	Cache,
	EventPublisher,
	Factory,
	FileFactory,
	ModelFactory,
	ModelRepository,
	ModelService,
	PermissionAssignmentFactory,
} from "../types";
import { MODEL_ADMIN, MODEL_RW } from "../../../common/src/permission-constants";
import { MODEL } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { ModelAuthorizationRuleset } from "../security/ruleset/model-authorization-ruleset";
import { SecurityContext } from "../security/security-context";
import { FileUpload } from "graphql-upload";
import { Model } from "../domain-entities/model";
import { FilterCondition } from "../dal/filter-condition";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import { GAME_MODEL_DELETED } from "../resolvers/subscription-resolvers";

@injectable()
export class ModelApplicationService implements ModelService {
	@inject(INJECTABLE_TYPES.Cache)
	cache: Cache;

	@inject(INJECTABLE_TYPES.EventPublisher)
	eventPublisher: EventPublisher;

	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;

	@inject(INJECTABLE_TYPES.ModelRepository)
	modelRepository: ModelRepository;

	@inject(INJECTABLE_TYPES.ModelAuthorizationRuleset)
	modelAuthorizationRuleset: ModelAuthorizationRuleset;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;
	@inject(INJECTABLE_TYPES.ModelFactory)
	modelFactory: ModelFactory;
	@inject(INJECTABLE_TYPES.PermissionAssignmentFactory)
	permissionAssignmentFactory: PermissionAssignmentFactory;

	createModel = async (
		context: SecurityContext,
		worldId: string,
		name: string,
		fileUpload: FileUpload,
		depth: number,
		width: number,
		height: number,
		notes: string
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const world = await unitOfWork.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		if (!(await this.modelAuthorizationRuleset.canCreate(context, world))) {
			throw new Error("You do not have permission to add models to this world");
		}

		fileUpload = await fileUpload;

		const file = this.fileFactory(null, fileUpload.filename, fileUpload.createReadStream(), null);
		await unitOfWork.fileRepository.create(file);
		const model = this.modelFactory(
			null,
			worldId,
			name,
			depth,
			width,
			height,
			file.filename,
			file._id,
			notes
		);
		await unitOfWork.modelRepository.create(model);
		for (let permission of [MODEL_RW, MODEL_ADMIN]) {
			const permissionAssignment = this.permissionAssignmentFactory(
				null,
				permission,
				model._id,
				MODEL
			);
			await unitOfWork.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		await unitOfWork.userRepository.update(context.user);
		await unitOfWork.commit();
		return model;
	};

	updateModel = async (
		context: SecurityContext,
		modelId: string,
		name: string,
		depth: number,
		width: number,
		height: number,
		notes: string,
		file?: FileUpload
	) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const model = await unitOfWork.modelRepository.findById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await this.modelAuthorizationRuleset.canWrite(context, model))) {
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

			const newFile = this.fileFactory(null, file.filename, file.createReadStream(), null);
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
		await unitOfWork.commit();
		return model;
	};

	deleteModel = async (context: SecurityContext, modelId: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const model = await unitOfWork.modelRepository.findById(modelId);
		if (!model) {
			throw new Error(`Model with id ${modelId} does not exist`);
		}
		if (!(await this.modelAuthorizationRuleset.canWrite(context, model))) {
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
		await unitOfWork.commit();
		return model;
	};

	getModels = async (context: SecurityContext, worldId: string): Promise<Model[]> => {
		const models = await this.modelRepository.find([new FilterCondition("world", worldId)]);
		const returnModels = [];
		for (let model of models) {
			if (await this.modelAuthorizationRuleset.canRead(context, model)) {
				returnModels.push(model);
			}
		}
		return returnModels;
	};

	private filenameExists = async (filename: string) => {
		const unitOfWork = this.dbUnitOfWorkFactory();
		const models = await unitOfWork.modelRepository.find([
			new FilterCondition("filename", filename),
		]);
		return models.length > 1;
	};
}
