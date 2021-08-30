import { SessionContext, UserService } from "../../types";
import { container } from "../../inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";

export const userResolvers = {
	setCurrentWorld: async (
		_: any,
		{ worldId }: { worldId: string },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<UserService>(INJECTABLE_TYPES.UserService);
		return service.setCurrentWorld(securityContext, worldId);
	},
};
