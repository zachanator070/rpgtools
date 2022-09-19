import {
	CookieManager, DbEngine,
	Factory,
	SessionContext,
	SessionContextFactory,
	UserFactory,
} from "../types";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { v4 as uuidv4 } from "uuid";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import { SecurityContextFactory } from "../security/security-context-factory";

import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE, AuthenticationService,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "../services/authentication-service";
import {DatabaseContext} from "../dal/database-context";
import {DatabaseSession} from "../dal/database-session";

@injectable()
export class ExpressSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	@inject(INJECTABLE_TYPES.DatabaseContextFactory)
	databaseContextFactory: Factory<DatabaseContext>

	@inject(INJECTABLE_TYPES.DbEngine)
	dbEngine: DbEngine;

	create = async (accessToken: string, refreshToken: string, cookieManager?: CookieManager): Promise<SessionContext> => {

		const databaseSession: DatabaseSession = await this.dbEngine.createDatabaseSession();

		const databaseContext: DatabaseContext = this.databaseContextFactory({session: databaseSession});

		let currentUser = await this.authenticationService.getUserFromAccessToken(accessToken, databaseContext);

		if (!currentUser) {
			if (cookieManager) {
				cookieManager.clearCookie(ACCESS_TOKEN);
			}

			currentUser = await this.authenticationService.getUserFromRefreshToken(
				refreshToken,
				databaseContext
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
						databaseContext
					);
					if (cookieManager) {
						cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
						cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);
					}
				} else {
					// refreshToken was invalidated
					if (cookieManager) {
						cookieManager.clearCookie(REFRESH_TOKEN);
					}
				}
			} else {
				currentUser = this.userFactory({_id: uuidv4(), email: "", username: ANON_USERNAME, password: "", tokenVersion: "", currentWorld: null, roles: []});
			}
		}

		const securityContext = await this.securityContextFactory.create(currentUser);

		return {
			cookieManager,
			securityContext,
			databaseContext
		};
	};
}
