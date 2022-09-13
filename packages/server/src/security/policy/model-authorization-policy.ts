import {EntityAuthorizationPolicy, UnitOfWork} from "../../types";
import { Model } from "../../domain-entities/model";
import { SecurityContext } from "../security-context";
import {
	MODEL_ADD,
	MODEL_ADMIN,
	MODEL_ADMIN_ALL,
	MODEL_READ,
	MODEL_READ_ALL,
	MODEL_RW,
	MODEL_RW_ALL,
} from "@rpgtools/common/src/permission-constants";
import { injectable } from "inversify";

@injectable()
export class ModelAuthorizationPolicy implements EntityAuthorizationPolicy<Model> {
	entity: Model;
	canAdmin = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			context.hasPermission(MODEL_ADMIN, this.entity) ||
			context.hasPermission(MODEL_ADMIN_ALL, world)
		);
	};

	canCreate = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return context.hasPermission(MODEL_ADD, world);
	};

	canRead = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			context.hasPermission(MODEL_READ, this.entity) ||
			context.hasPermission(MODEL_READ_ALL, world) ||
			this.canWrite(context, unitOfWork)
		);
	};

	canWrite = async (context: SecurityContext, unitOfWork: UnitOfWork): Promise<boolean> => {
		const world = await unitOfWork.worldRepository.findById(this.entity.world);
		return (
			context.hasPermission(MODEL_RW, this.entity) ||
			context.hasPermission(MODEL_RW_ALL, world)
		);
	};
}
