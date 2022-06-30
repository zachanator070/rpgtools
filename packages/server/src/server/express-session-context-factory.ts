import {
	AuthenticationService,
	CookieManager,
	Factory,
	SessionContext,
	SessionContextFactory,
	UnitOfWork,
	UserFactory,
} from "../types";
import { Request, Response } from "express";
import { ExpressContext } from "apollo-server-express/src/ApolloServer";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { v4 as uuidv4 } from "uuid";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import { ExpressCookieManager } from "./express-cookie-manager";
import { SecurityContextFactory } from "../security/security-context-factory";
import { DbUnitOfWork } from "../dal/db-unit-of-work";
import {
	ACCESS_TOKEN,
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN,
	REFRESH_TOKEN_MAX_AGE,
} from "../services/authentication-application-service";

export class ExpressSessionContextParameters implements ExpressContext {
	req: Request;
	res: Response;
}

@injectable()
export class ExpressSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.AuthenticationService)
	authenticationService: AuthenticationService;

	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	@inject(INJECTABLE_TYPES.DbUnitOfWorkFactory)
	dbUnitOfWorkFactory: Factory<DbUnitOfWork>;

	create = async ({
		req,
		res
	}: ExpressSessionContextParameters): Promise<SessionContext> => {
		const unitOfWork: UnitOfWork = this.dbUnitOfWorkFactory();
		const cookieManager: CookieManager = new ExpressCookieManager(res);

		const refreshToken: string = req.cookies["refreshToken"];
		const accessToken: string = req.cookies["accessToken"];

		let currentUser = await this.authenticationService.getUserFromAccessToken(accessToken, unitOfWork);

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
				currentUser = this.userFactory(uuidv4(), "", ANON_USERNAME, "", "", null, [], []);
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