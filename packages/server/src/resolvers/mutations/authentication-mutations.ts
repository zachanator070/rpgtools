import { SessionContext } from "../../types";
import { container } from "../../di/inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import {AuthenticationService} from "../../services/authentication-service";
export const SALT_ROUNDS = 10;

interface LoginArgs {
	username: string;
	password: string;
}

interface RegisterArgs {
	registerCode: string;
	email: string;
	username: string;
	password: string;
}

export const authenticationMutations: any = {
	login: async (
		parent: any,
		{ username, password }: LoginArgs,
		{ cookieManager, databaseContext }: SessionContext
	) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.login(username, password, cookieManager, databaseContext);
	},
	logout: async (parent: any, any: any, { cookieManager, securityContext, databaseContext }: SessionContext) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.logout(securityContext.user, cookieManager, databaseContext);
	},
	register: async (
		parent: any,
		{ registerCode, email, username, password }: RegisterArgs,
		{ databaseContext }: SessionContext
	) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.register(registerCode, email, username, password, databaseContext);
	},
};
