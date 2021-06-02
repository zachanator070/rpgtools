import {
	ApplicationService,
	Cache,
	FileRepository,
	ModelRepository,
	PermissionAssignmentRepository,
	UserRepository,
	WorldRepository,
} from "../types";
import { MODEL_ADMIN, MODEL_RW } from "../../../common/src/permission-constants";
import { MODEL } from "../../../common/src/type-constants";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { ModelAuthorizationRuleset } from "../security/model-authorization-ruleset";
import { SecurityContext } from "../security-context";
import { FileUpload } from "graphql-upload";
import { File } from "../domain-entities/file";
import { Model } from "../domain-entities/model";
import { PermissionAssignment } from "../domain-entities/permission-assignment";
import { FilterCondition } from "../dal/filter-condition";

export class ModelService implements ApplicationService {
	@inject(INJECTABLE_TYPES.ModelRepository)
	modelRepository: ModelRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;
	@inject(INJECTABLE_TYPES.PermissionAssignmentRepository)
	permissionAssignmentRepository: PermissionAssignmentRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;
	@inject(INJECTABLE_TYPES.UserRepository)
	userRepository: UserRepository;

	@inject(INJECTABLE_TYPES.Cache)
	cache: Cache;

	modelAuthorizationRuleset: ModelAuthorizationRuleset = new ModelAuthorizationRuleset();

	filenameExists = async (filename: string) => {
		const models = await this.modelRepository.find([new FilterCondition("filename", filename)]);
		return models.length > 1;
	};

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
		const world = await this.worldRepository.findById(worldId);
		if (!world) {
			throw new Error(`World with id ${worldId} does not exist`);
		}

		if (!(await this.modelAuthorizationRuleset.canCreate(context, world))) {
			throw new Error("You do not have permission to add models to this world");
		}

		fileUpload = await fileUpload;
		if (await this.filenameExists(fileUpload.filename)) {
			// this seems silly, why is this??
			throw new Error(`Filename ${fileUpload.filename} already exists, filenames must be unique`);
		}

		const file = new File("", fileUpload.filename, fileUpload.createReadStream());
		await this.fileRepository.create(file);
		const model = new Model(
			"",
			worldId,
			name,
			depth,
			width,
			height,
			file.filename,
			file._id,
			notes
		);
		for (let permission of [MODEL_RW, MODEL_ADMIN]) {
			const permissionAssignment = new PermissionAssignment("", permission, model._id, MODEL);
			await this.permissionAssignmentRepository.create(permissionAssignment);
			context.user.permissions.push(permissionAssignment._id);
			context.permissions.push(permissionAssignment);
		}
		await this.userRepository.update(context.user);
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
		const model = await this.modelRepository.findById(modelId);
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
				const file = await this.fileRepository.findById(model.fileId);
				await this.fileRepository.delete(file);
			}
			file = await file;

			if (await this.filenameExists(file.filename)) {
				throw new Error(`Filename ${file.filename} already exists, filenames must be unique`);
			}
			const newFile = new File("", file.filename, file.createReadStream());
			await this.fileRepository.create(newFile);
			model.fileId = newFile._id;
			model.fileName = file.filename;
		}
		model.name = name;
		model.depth = depth;
		model.width = width;
		model.height = height;
		model.notes = notes;
		await this.modelRepository.update(model);
		return model;
	};
}
