import { SessionContext } from "../../types";
import { IResolverObject } from "apollo-server-express";
export const SALT_ROUNDS = 10;

type LoginArgs = {
	username: string;
	password: string;
};

type RegisterArgs = {
	registerCode: string;
	email: string;
	username: string;
	password: string;
};

export const authenticationMutations: IResolverObject<any, SessionContext> = {
	login: async (
		parent: any,
		{ username, password }: LoginArgs,
		{ cookieManager, authenticationService }: SessionContext
	) => {
		await authenticationService.login(username, password, cookieManager);
	},
	logout: async (
		parent: any,
		any: any,
		{ cookieManager, authenticationService, currentUser }: SessionContext
	) => {
		await authenticationService.logout(currentUser, cookieManager);
	},
	register: async (
		parent: any,
		{ registerCode, email, username, password }: RegisterArgs,
		{ authenticationService }: SessionContext
	) => {
		await authenticationService.register(registerCode, email, username, password);
	},
};
