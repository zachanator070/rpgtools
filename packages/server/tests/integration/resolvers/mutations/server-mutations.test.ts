import { createTestClient } from "apollo-server-testing";
import { ANON_USERNAME } from "../../../../../common/src/permission-constants";
import { GENERATE_REGISTER_CODES } from "../../../../../frontend/src/hooks/server/useGenerateRegisterCodes";
import { UNLOCK_SERVER } from "../../../../../frontend/src/hooks/server/useUnlockServer";
import { container } from "../../../../src/inversify.config";
import { INJECTABLE_TYPES } from "../../../../src/injectable-types";
import {
	CookieManager,
	ServerConfigRepository,
	SessionContext,
	SessionContextFactory,
	UserRepository,
} from "../../../../src/types";
import { User } from "../../../../src/domain-entities/user";
import { ExpressApiServer } from "../../../../src/express-api-server";
import { FilterCondition } from "../../../../src/dal/filter-condition";
import { inject, injectable } from "inversify";
import { SecurityContextFactory } from "../../../../src/security-context-factory";

process.env.TEST_SUITE = "server-mutations-test";

describe("server mutations", () => {
	const createContext = async (securityContextFactory: SecurityContextFactory) => {
		return await securityContextFactory.create(currentUser);
	};
	@injectable()
	class MockSessionContextFactory implements SessionContextFactory {
		@inject(INJECTABLE_TYPES.SecurityContextFactory)
		securityContextFactory: SecurityContextFactory;
		create = async (parameters: any): Promise<SessionContext> => ({
			securityContext: await createContext(this.securityContextFactory),
			cookieManager: new (class extends CookieManager {})(),
		});
	}
	let currentUser = new User("", "", ANON_USERNAME, "", "", "", [], []);
	container
		.rebind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
		.to(MockSessionContextFactory);

	const server: ExpressApiServer = container.get<ExpressApiServer>(INJECTABLE_TYPES.ApiServer);

	const { mutate } = createTestClient(server.gqlServer);

	describe("with locked server", () => {
		const resetConfig = async () => {
			const serverConfigRepository = container.get<ServerConfigRepository>(
				INJECTABLE_TYPES.ServerConfigRepository
			);
			const serverConfig = await serverConfigRepository.findOne([]);
			serverConfig.unlockCode = "asdf";
			serverConfig.adminUsers = [];
			await serverConfigRepository.update(serverConfig);
			await server.checkConfig();
		};
		beforeEach(async () => {
			await resetConfig();
		});

		afterEach(async () => {
			await resetConfig();
		});

		it("unlock", async (done) => {
			const result = await mutate({
				mutation: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			expect(result).toMatchSnapshot();
			done();
		});

		test("unlock twice", async () => {
			await mutate({
				mutation: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			const result = await mutate({
				mutation: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			expect(result).toMatchSnapshot();
		});
	});

	test("generate register codes no permission", async () => {
		const result = await mutate({
			mutation: GENERATE_REGISTER_CODES,
			variables: { amount: 10 },
		});
		expect(result).toMatchSnapshot();
	});

	describe("with authenticated user", () => {
		beforeEach(async () => {
			const userRepository = container.get<UserRepository>(INJECTABLE_TYPES.UserRepository);
			currentUser = await userRepository.findOne([new FilterCondition("username", "tester")]);
		});

		test("generate register codes", async () => {
			const result = await mutate({
				mutation: GENERATE_REGISTER_CODES,
				variables: { amount: 10 },
			});
			expect(result).toMatchSnapshot({
				data: {
					generateRegisterCodes: {
						_id: expect.any(String),
						registerCodes: expect.arrayContaining([expect.any(String)]),
					},
				},
			});
		});
	});
});
