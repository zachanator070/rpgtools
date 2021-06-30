import { EntityAuthorizationRuleset } from "../types";
import { Model } from "../domain-entities/model";
import { SecurityContext } from "../security-context";
import {
	MODEL_ADD,
	MODEL_ADMIN,
	MODEL_ADMIN_ALL,
	MODEL_READ,
	MODEL_READ_ALL,
	MODEL_RW,
	MODEL_RW_ALL,
} from "../../../common/src/permission-constants";
import { World } from "../domain-entities/world";
import { injectable } from "inversify";

@injectable()
export class ModelAuthorizationRuleset implements EntityAuthorizationRuleset<Model, World> {
	canAdmin = async (context: SecurityContext, entity: Model): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_ADMIN, entity._id) ||
			context.hasPermission(MODEL_ADMIN_ALL, entity.world)
		);
	};

	canCreate = async (context: SecurityContext, entity: World): Promise<boolean> => {
		return context.hasPermission(MODEL_ADD, entity._id);
	};

	canRead = async (context: SecurityContext, entity: Model): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_READ, entity._id) ||
			context.hasPermission(MODEL_READ_ALL, entity.world) ||
			this.canWrite(context, entity)
		);
	};

	canWrite = async (context: SecurityContext, entity: Model): Promise<boolean> => {
		return (
			context.hasPermission(MODEL_RW, entity._id) ||
			context.hasPermission(MODEL_RW_ALL, entity.world)
		);
	};
}
