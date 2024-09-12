import {EntityAuthorizationPolicy} from "../../types";
import { Model } from "../../domain-entities/model.js";
import { SecurityContext } from "../security-context.js";
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
import {DatabaseContext} from "../../dal/database-context.js";

@injectable()
export class ModelAuthorizationPolicy implements EntityAuthorizationPolicy {
	entity: Model;
	canAdmin = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(MODEL_ADMIN, this.entity) ||
			context.hasPermission(MODEL_ADMIN_ALL, world)
		);
	};

	canCreate = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return context.hasPermission(MODEL_ADD, world);
	};

	canRead = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(MODEL_READ, this.entity) ||
			context.hasPermission(MODEL_READ_ALL, world) ||
			this.canWrite(context, databaseContext)
		);
	};

	canWrite = async (context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> => {
		const world = await databaseContext.worldRepository.findOneById(this.entity.world);
		return (
			context.hasPermission(MODEL_RW, this.entity) ||
			context.hasPermission(MODEL_RW_ALL, world)
		);
	};
}
