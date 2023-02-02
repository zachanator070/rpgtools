import {
	AuthenticationTokens,
	CookieManager,
} from "../types";
import { User } from "../domain-entities/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {ServerProperties} from "../server/server-properties";
import {DatabaseContext} from "../dal/database-context";
import UserFactory from "../domain-entities/factory/user-factory";

export interface CookieConstants {
	string: string;
	ms: number;
}
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN_MAX_AGE: CookieConstants = { string: "30m", ms: 1000 * 60 * 30 };
export const REFRESH_TOKEN_MAX_AGE: CookieConstants = { string: "1d", ms: 1000 * 60 * 60 * 24 };

@injectable()
export class AuthenticationService {
	SALT_ROUNDS = 10;

	@inject(INJECTABLE_TYPES.UserFactory)
	userFactory: UserFactory;

	@inject(INJECTABLE_TYPES.ServerProperties)
	serverProperties: ServerProperties;

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
			console.error(e);
		}
	};

	decodeAccessToken = async (accessToken: string): Promise<any> => {
		try {
			return jwt.verify(accessToken, this.serverProperties.accessTokenSecret, {
				maxAge: ACCESS_TOKEN_MAX_AGE.string,
			});
		} catch (e) {
			console.error(e);
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
		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw Error("Login failure: username or password are incorrect");
		}
		let tokens = await this.createTokens(user, null, databaseContext);
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

	register = async (
		registerCode: string,
		email: string,
		username: string,
		password: string,
		databaseContext: DatabaseContext
	): Promise<User> => {
		const config = await databaseContext.serverConfigRepository.findOne();
		if (!config.registerCodes.includes(registerCode)) {
			throw new Error("Register code not valid");
		}
		const newUser = await this.registerUser(email, username, password, databaseContext)
		config.registerCodes = config.registerCodes.filter((code) => code !== registerCode);
		await databaseContext.serverConfigRepository.update(config);
		return newUser;
	};

	registerUser = async (
		email: string,
		username: string,
		password: string,
		databaseContext: DatabaseContext
	): Promise<User> => {
		password = bcrypt.hashSync(password, this.SALT_ROUNDS);
		let existingUsers = await databaseContext.userRepository.findByEmail(email);
		if (existingUsers.length > 0) {
			throw Error("Registration Error: Email already used");
		}
		existingUsers = await databaseContext.userRepository.findByUsername(username);
		if (existingUsers.length > 0) {
			throw Error("Registration Error: Username already used");
		}
		const newUser = this.userFactory.build({ email, username, password, tokenVersion: null, currentWorld: null, roles: []});
		await databaseContext.userRepository.create(newUser);
		return newUser;
	};
}
