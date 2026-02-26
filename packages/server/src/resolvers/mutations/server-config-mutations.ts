import { container } from "../../di/inversify.js";
import { INJECTABLE_TYPES } from "../../di/injectable-types.js";
import { SessionContext } from "../../types.js";
import {ServerConfigService} from "../../services/server-config-service.js";

export const serverConfigMutations = {
	unlockServer: async (
		_: any,
		{
			unlockCode,
			email,
			username,
			password,
		}: { unlockCode: string; email: string; username: string; password: string },
		{databaseContext}: SessionContext
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return await databaseContext.openTransaction(async () => service.unlockServer(unlockCode, email, username, password, databaseContext));
	},
	inviteUser: async (
		_: any,
		{ email }: { email: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return await databaseContext.openTransaction(async () => service.inviteUser(securityContext, email, databaseContext));
	},
	setDefaultWorld: async (
		_: any,
		{ worldId }: { worldId: string },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return await databaseContext.openTransaction(async () => service.setDefaultWorld(securityContext, worldId, databaseContext));
	},
};
