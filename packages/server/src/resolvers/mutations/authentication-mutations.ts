import { AuthenticationService, SessionContext } from "../../types";
import { IResolverObject } from "apollo-server-express";
import { container } from "../../inversify.config";
import { INJECTABLE_TYPES } from "../../injectable-types";
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

export const authenticationMutations: IResolverObject<any, SessionContext> = {
	login: async (
		parent: any,
		{ username, password }: LoginArgs,
		{ cookieManager }: SessionContext
	) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.login(username, password, cookieManager);
	},
	logout: async (parent: any, any: any, { cookieManager, securityContext }: SessionContext) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.logout(securityContext.user, cookieManager);
	},
	register: async (
		parent: any,
		{ registerCode, email, username, password }: RegisterArgs,
		_: SessionContext
	) => {
		const authenticationService = container.get<AuthenticationService>(
			INJECTABLE_TYPES.AuthenticationService
		);
		return await authenticationService.register(registerCode, email, username, password);
	},
};
