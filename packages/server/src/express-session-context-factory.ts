import {
	AuthenticationService,
	CookieManager,
	SessionContext,
	SessionContextFactory,
	SessionContextParameters,
	UnitOfWork,
} from "./types";
import { Request, Response } from "express";
import { ExpressContext } from "apollo-server-express/src/ApolloServer";
import { ExecutionParams } from "subscriptions-transport-ws";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "./injectable-types";
import { v4 as uuidv4 } from "uuid";
import { User } from "./domain-entities/user";
import { ANON_USERNAME } from "../../common/src/permission-constants";
import { ExpressCookieManager } from "./express-cookie-manager";
import { SecurityContextFactory } from "./security-context-factory";
import { DbUnitOfWork } from "./dal/db-unit-of-work";
import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "./services/authentication-application-service";

export class ExpressSessionContextParameters implements SessionContextParameters, ExpressContext {
	req: Request;
	res: Response;
	connection?: ExecutionParams;
}

export class ExpressSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	securityContextFactory: SecurityContextFactory = new SecurityContextFactory();

	create = async ({
		req,
		res,
		connection,
	}: ExpressSessionContextParameters): Promise<SessionContext> => {
		const unitOfWork: UnitOfWork = new DbUnitOfWork();
		const cookieManager: CookieManager = new ExpressCookieManager(res);
		let currentUser = null;
		if (connection) {
			return connection.context;
		}

		const refreshToken: string = req.cookies["refreshToken"];
		const accessToken: string = req.cookies["accessToken"];

		currentUser = await this.authenticationService.getUserFromAccessToken(accessToken, unitOfWork);
		if (!currentUser) {
			cookieManager.clearCookie(ACCESS_TOKEN);
			currentUser = await this.authenticationService.getUserFromRefreshToken(
				refreshToken,
				unitOfWork
			);

			// if refreshToken is still valid issue new access token and refresh token
			if (currentUser) {
				const version: string = await this.authenticationService.getRefreshTokenVersion(
					refreshToken
				);
				if (currentUser.tokenVersion === version) {
					let tokens = await this.authenticationService.createTokens(
						currentUser,
						version,
						unitOfWork
					);
					cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
					cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);
				} else {
					// refreshToken was invalidated
					cookieManager.clearCookie(REFRESH_TOKEN);
				}
			} else {
				currentUser = new User(uuidv4(), "", ANON_USERNAME, "", "", null, [], []);
			}
		}

		const securityContext = await this.securityContextFactory.create(currentUser);
		await unitOfWork.commit();

		return {
			cookieManager,
			securityContext,
		};
	};
}
