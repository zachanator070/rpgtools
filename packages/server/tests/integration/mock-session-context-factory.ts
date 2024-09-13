import {inject, injectable} from "inversify";
import {CookieManager, DbEngine, SessionContext, SessionContextFactory} from "../../src/types";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types.js";
import { SecurityContextFactory } from "../../src/security/security-context-factory.js";
import { User } from "../../src/domain-entities/user.js";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import {v4 as uuidv4} from 'uuid';
import UserFactory from "../../src/domain-entities/factory/user-factory.js";

class MockCookieManager implements CookieManager {
	clearCookie(cookie: string): void {}

	setCookie(cookie: string, value: string, age: number): void {}
}

@injectable()
export class MockSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;
	@inject(INJECTABLE_TYPES.DbEngine)
	dbEngine: DbEngine;

	userFactory: UserFactory;
	currentUser: User;

	constructor(
		@inject(INJECTABLE_TYPES.UserFactory)
		userFactory: UserFactory
	) {
		this.userFactory = userFactory;
		this.useAnonUser();
	}

	getAnon = (): User => {
		return this.userFactory.build({_id: uuidv4(), email: null, username: ANON_USERNAME, password: null, tokenVersion: null, currentWorld: null, roles: []});
	};

	setCurrentUser = (user: User) => {
		this.currentUser = user;
	};

	useAnonUser = () => {
		this.currentUser = this.getAnon();
	};

	create = async (parameters: any): Promise<SessionContext> => {
		const databaseContext = await this.dbEngine.createDatabaseContext();
		const securityContext = await this.securityContextFactory.create(this.currentUser, databaseContext);
		const cookieManager = new MockCookieManager();
		return {
			securityContext,
			cookieManager,
			databaseContext
		};
	};
}
