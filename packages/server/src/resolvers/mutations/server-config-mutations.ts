import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { SessionContext } from "../../types";
import {ServerConfigService} from "../../services/server-config-service";

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
		return await service.unlockServer(unlockCode, email, username, password, databaseContext);
	},
	generateRegisterCodes: async (
		_: any,
		{ amount }: { amount: number },
		{ securityContext, databaseContext }: SessionContext
	) => {
		const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
		const serverConfig = await service.generateRegisterCodes(securityContext, amount, databaseContext);
		return serverConfig;
	},
};
