import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {UserService} from "../../services/user-service";

export const userResolvers = {
	setCurrentWorld: async (
		_: any,
		{ worldId }: { worldId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return await databaseContext.openTransaction(async () => service.setCurrentWorld(securityContext, worldId, databaseContext));
	},
};
