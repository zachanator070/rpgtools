import { inject, injectable } from "inversify";
import { CookieManager, SessionContext, SessionContextFactory, UserFactory } from "../../src/types";
import { INJECTABLE_TYPES } from "../../src/injectable-types";
import { SecurityContextFactory } from "../../src/security-context-factory";
import { User } from "../../src/domain-entities/user";
import { ANON_USERNAME } from "../../../common/src/permission-constants";

class MockCookieManager implements CookieManager {
	clearCookie(cookie: string): void {}

	setCookie(cookie: string, value: string, age: number): void {}
}

@injectable()
export class MockSessionContextFactory implements SessionContextFactory {
	@inject(INJECTABLE_TYPES.SecurityContextFactory)
	securityContextFactory: SecurityContextFactory;

	userFactory: UserFactory;
	currentUser: User;

	constructor(
		@inject(INJECTABLE_TYPES.UserFactory)
		userFactory: UserFactory
	) {
		this.userFactory = userFactory;
		this.currentUser = this.getAnon();
		this.resetCurrentUser();
	}

	getAnon = (): User => {
		return this.userFactory(null, null, ANON_USERNAME, null, null, null, [], []);
	};

	setCurrentUser = (user: User) => {
		this.currentUser = user;
	};
	resetCurrentUser = () => {
		this.currentUser = this.getAnon();
	};

	create = async (parameters: any): Promise<SessionContext> => {
		const securityContext = await this.securityContextFactory.create(this.currentUser);
		const cookieManager = new MockCookieManager();
		return {
			securityContext,
			cookieManager,
		};
	};
}
