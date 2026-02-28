import {
	AuthenticationTokens,
	CookieManager,
} from "../types.js";
import { User } from "../domain-entities/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {ServerProperties} from "../server/server-properties.js";
import {DatabaseContext} from "../dal/database-context.js";
import UserFactory from "../domain-entities/factory/user-factory.js";
import Logger from "../logging/logger.js";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants.js";
import axios from "axios";

export interface CookieConstants {
	string: string;
	ms: number;
}
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN_MAX_AGE: CookieConstants = { string: "5m", ms: 1000 * 60 * 5 };
export const REFRESH_TOKEN_MAX_AGE: CookieConstants = { string: "1d", ms: 1000 * 60 * 60 * 24 };

@injectable()
export class AuthenticationService {
	SALT_ROUNDS = 10;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	@inject(INJECTABLE_TYPES.ServerProperties)
	serverProperties: ServerProperties;

	@inject(INJECTABLE_TYPES.Logger)
	logger: Logger;

	createTokens = async (
		user: User,
		version: string,
		databaseContext: DatabaseContext
	): Promise<AuthenticationTokens> => {
		const accessToken = jwt.sign({ userId: user._id }, this.serverProperties.accessTokenSecret, {
			expiresIn: ACCESS_TOKEN_MAX_AGE.string,
		});
		if (!version) {
			version = uuidv4();
		}
		const refreshToken = jwt.sign(
			{
				version: version,
				userId: user._id,
			},
			this.serverProperties.refreshTokenSecret,
			{ expiresIn: REFRESH_TOKEN_MAX_AGE.string }
		);
		if (version !== user.tokenVersion) {
			user.tokenVersion = version;
			await databaseContext.userRepository.update(user);
		}
		return { accessToken, refreshToken };
	};

	decodeRefreshToken = async (refreshToken: string): Promise<any> => {
		try {
			return jwt.verify(refreshToken, this.serverProperties.refreshTokenSecret, {
				maxAge: REFRESH_TOKEN_MAX_AGE.string,
			});
		} catch (e) {
			this.logger.error("Error decoding refresh token", e);
		}
	};

	decodeAccessToken = async (accessToken: string): Promise<any> => {
		try {
			return jwt.verify(accessToken, this.serverProperties.accessTokenSecret, {
				maxAge: ACCESS_TOKEN_MAX_AGE.string,
			});
		} catch (e) {
			this.logger.error("Error decoding access token", e);
		}
	};

	getRefreshTokenVersion = async (refreshToken: string): Promise<string> => {
		if(refreshToken) {
			let data: any = await this.decodeRefreshToken(refreshToken);
			return data.version;
		}
	};

	getUserFromAccessToken = async (accessToken: string, databaseContext: DatabaseContext): Promise<User> => {
		if(accessToken){
			let data: any = await this.decodeAccessToken(accessToken);
			if(data) {
				return await databaseContext.userRepository.findOneById(data.userId);
			}
		}
	};

	getUserFromRefreshToken = async (refreshToken: string, databaseContext: DatabaseContext): Promise<User> => {
		if(refreshToken){
			let data: any = await this.decodeRefreshToken(refreshToken);
			if(data) {
				return await databaseContext.userRepository.findOneById(data.userId);
			}
		}
	};

	login = async (
		username: string,
		password: string,
		cookieManager: CookieManager,
		databaseContext: DatabaseContext
	): Promise<User> => {
		const user = await databaseContext.userRepository.findOneByUsername(username);
		if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
			throw Error("Login failure: username or password are incorrect");
		}
		const refreshToken = cookieManager.getResponseCookie(REFRESH_TOKEN);
		const accessToken = cookieManager.getResponseCookie(ACCESS_TOKEN);
		if (!refreshToken && !accessToken) {
			let tokens = await this.createTokens(user, null, databaseContext);
			if (!accessToken) {
				cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
			}
			if (!refreshToken) {
				cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);
			}
		}
		return user;
	};

	loginSso = async (
		code: string,
		state: string,
		callbackUri: string,
		cookieManager: CookieManager,
		databaseContext: DatabaseContext
	): Promise<User> => {
		if (!this.serverProperties.isSsoConfigured()) {
			throw new Error("SSO is not configured");
		}

		const decodedState = jwt.verify(state, this.serverProperties.ssoStateSecret) as {
			jti?: string;
		};

		if (!decodedState?.jti) {
			throw new Error("Invalid state token");
		}

		const email = await this.getSsoEmail(code, callbackUri);

		const users = await databaseContext.userRepository.findByEmail(email);
		if (!users || users.length === 0) {
			throw Error("Login failure: user not found");
		}
		const user = users[0];

		const tokens = await this.createTokens(user, user.tokenVersion, databaseContext);
		cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
		cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);
		return user;
	};

	registerFromSso = async (
		code: string,
		state: string,
		callbackUri: string,
		cookieManager: CookieManager,
		databaseContext: DatabaseContext
	): Promise<User> => {
		if (!this.serverProperties.isSsoConfigured()) {
			throw new Error("SSO is not configured");
		}

		const decodedState = jwt.verify(state, this.serverProperties.ssoStateSecret) as {
			username?: string;
			password?: string;
		};
		const username = this.validateAndNormalizeUsername(decodedState.username || "");

		const normalizedEmail = await this.getSsoEmail(code, callbackUri);

		const user = await this.registerWithInvite(normalizedEmail, username, null, databaseContext);

		const tokens = await this.createTokens(user, user.tokenVersion, databaseContext);
		cookieManager.setCookie(ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_MAX_AGE.ms);
		cookieManager.setCookie(REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE.ms);

		return user;
	};

	logout = async (currentUser: User, cookieManager: CookieManager, databaseContext: DatabaseContext): Promise<string> => {
		cookieManager.clearCookie(ACCESS_TOKEN);
		cookieManager.clearCookie(REFRESH_TOKEN);
		currentUser.tokenVersion = uuidv4();
		await databaseContext.userRepository.update(currentUser);
		return "success";
	};

	registerWithInvite = async (
		email: string,
		username: string,
		password: string | null,
		databaseContext: DatabaseContext
	): Promise<User> => {
		const normalizedEmail = email?.trim().toLowerCase();
		if (!normalizedEmail) {
			throw new Error("Registration Error: Email is required");
		}

		const invites = await databaseContext.inviteRepository.findByEmail(normalizedEmail);
		if (invites.length === 0) {
			throw new Error("Registration Error: No invite exists for this email");
		}

		const newUser = await this.registerUser(normalizedEmail, username, password, databaseContext);
		for (const invite of invites) {
			await databaseContext.inviteRepository.delete(invite);
		}

		await databaseContext.inviteRepository.deleteByEmail(normalizedEmail);
		return newUser;
	};

	getSsoEmail = async (code: string, callbackUri: string): Promise<string> => {
		const tokenPayload = new URLSearchParams({
			code,
			client_id: this.serverProperties.googleClientId,
			client_secret: this.serverProperties.googleClientSecret,
			redirect_uri: callbackUri,
			grant_type: "authorization_code",
		});

		const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", tokenPayload.toString(), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const accessToken = tokenResponse?.data?.access_token;
		if (!accessToken) {
			throw new Error("Google token response missing access token");
		}

		const userInfoResponse = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const email = String(userInfoResponse?.data?.email || "").trim().toLowerCase();
		if (!email) {
			throw new Error("Google user info did not include an email");
		}

		return email;
	};

	registerUser = async (
		email: string,
		username: string,
		password: string | null,
		databaseContext: DatabaseContext
	): Promise<User> => {
		const normalizedEmail = email?.trim().toLowerCase();
		if (!normalizedEmail) {
			throw Error("Registration Error: Email is required");
		}

		const normalizedUsername = this.validateAndNormalizeUsername(username);
		const hashedPassword = password ? bcrypt.hashSync(password, this.SALT_ROUNDS) : null;
		let existingUsers = await databaseContext.userRepository.findByEmail(normalizedEmail);
		if (existingUsers.length > 0) {
			throw Error("Registration Error: Email already used");
		}
		existingUsers = await databaseContext.userRepository.findByUsername(normalizedUsername);
		if (existingUsers.length > 0) {
			throw Error("Registration Error: Username already used");
		}
		const newUser = this.userFactory.build({ email: normalizedEmail, username: normalizedUsername, password: hashedPassword, tokenVersion: null, currentWorld: null, roles: []});
		await databaseContext.userRepository.create(newUser);
		return newUser;
	};

	validateAndNormalizeUsername = (username: string): string => {
		if (username === null || username === undefined) {
			throw Error("Registration Error: Username is required");
		}
		const normalizedUsername = username.trim();
		if (!normalizedUsername) {
			throw Error("Registration Error: Username is required");
		}
		if (normalizedUsername.toLowerCase() === ANON_USERNAME.toLowerCase()) {
			throw Error("Registration Error: Username not allowed");
		}
		return normalizedUsername;
	};
}
