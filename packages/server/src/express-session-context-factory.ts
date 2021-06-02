import {
	CookieManager,
	SessionContext,
	SessionContextFactory,
	SessionContextParameters,
} from "./types";
import { Request, Response } from "express";
import { ExpressContext } from "apollo-server-express/src/ApolloServer";
import { ExecutionParams } from "subscriptions-transport-ws";
import { AuthenticationService } from "./services/authentication-service";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "./injectable-types";
import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "./constants";
import { v4 as uuidv4 } from "uuid";
import { User } from "./domain-entities/user";
import { ANON_USERNAME } from "../../common/src/permission-constants";
import { ExpressCookieManager } from "./express-cookie-manager";
import { AuthorizationService } from "./services/authorization-service";
import { SecurityContextFactory } from "./security-context-factory";
import { WikiFolderService } from "./services/wiki-folder-service";

export class ExpressSessionContextParameters implements SessionContextParameters, ExpressContext {
	req: Request;
	res: Response;
	connection?: ExecutionParams;
}

export class ExpressSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;
	@inject(INJECTABLE_TYPES.AuthorizationService)
	authorizationService: AuthorizationService;
	@inject(INJECTABLE_TYPES.WikiFolderService)
	wikiFolderService: WikiFolderService;

	securityContextFactory: SecurityContextFactory = new SecurityContextFactory();

	create = async ({
		req,
		res,
		connection,
	}: ExpressSessionContextParameters): Promise<SessionContext> => {
		const cookieManager: CookieManager = new ExpressCookieManager(res);
		let currentUser = null;
		if (connection) {
			return connection.context;
		}

		const refreshToken: string = req.cookies["refreshToken"];
		const accessToken: string = req.cookies["accessToken"];

		currentUser = await this.authenticationService.getUserFromAccessToken(accessToken);
		if (!currentUser) {
			cookieManager.clearCookie(ACCESS_TOKEN);
			currentUser = await this.authenticationService.getUserFromRefreshToken(refreshToken);

			// if refreshToken is still valid issue new access token and refresh token
			if (currentUser) {
				const version: string = await this.authenticationService.getRefreshTokenVersion(
					refreshToken
				);
				if (currentUser.tokenVersion === version) {
					let tokens = await this.authenticationService.createTokens(currentUser, version);
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

		return {
			cookieManager,
			securityContext,
		};
	};
}
