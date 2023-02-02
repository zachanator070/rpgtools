import {inject, injectable} from "inversify";
import {CookieManager, DbEngine, SessionContext, SessionContextFactory} from "../../src/types";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import { SecurityContextFactory } from "../../src/security/security-context-factory";
import { User } from "../../src/domain-entities/user";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import {Factory} from "../../src/types";
import {v4 as uuidv4} from 'uuid';
import {DatabaseContext} from "../../src/dal/database-context";
import UserFactory from "../../src/domain-entities/factory/user-factory";

class MockCookieManager implements CookieManager {
	clearCookie(cookie: string): void {}

	setCookie(cookie: string, value: string, age: number): void {}
}

@injectable()
export class MockSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;
	@inject(INJECTABLE_TYPES.DatabaseContextFactory)
	databaseContextFactory: Factory<DatabaseContext>;
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
		const securityContext = await this.securityContextFactory.create(this.currentUser);
		const cookieManager = new MockCookieManager();
		return {
			securityContext,
			cookieManager,
			databaseContext: this.databaseContextFactory({session: await this.dbEngine.createDatabaseSession()})
		};
	};
}
