import { container } from "../../inversify.config";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ServerConfigService, SessionContext } from "../../types";

export const serverMutations = {
	unlockServer: async (
		_: any,
		{
			unlockCode,
			email,
			username,
			password,
		}: { unlockCode: string; email: string; username: string; password: string }
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		return await service.unlockServer(unlockCode, email, username, password);
	},
	generateRegisterCodes: async (
		_: any,
		{ amount }: { amount: number },
		{ securityContext }: SessionContext
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		const serverConfig = await service.generateRegisterCodes(securityContext, amount);
		return serverConfig;
	},
};
