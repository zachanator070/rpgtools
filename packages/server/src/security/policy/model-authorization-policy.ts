import { EntityAuthorizationPolicy } from "../../types";
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
	canAdmin = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_ADMIN, this.entity._id) ||
			context.hasPermission(MODEL_ADMIN_ALL, this.entity.world)
		);
	};

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		return context.hasPermission(MODEL_ADD, this.entity.world);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_READ, this.entity._id) ||
			context.hasPermission(MODEL_READ_ALL, this.entity.world) ||
			this.canWrite(context)
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_RW, this.entity._id) ||
			context.hasPermission(MODEL_RW_ALL, this.entity.world)
		);
	};
}
