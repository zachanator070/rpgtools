import { GENERATE_REGISTER_CODES } from "../../../../../frontend/src/hooks/server/useGenerateRegisterCodes";
import { UNLOCK_SERVER } from "../../../../../frontend/src/hooks/server/useUnlockServer";
import { container } from "../../../../src/inversify.config";
import { INJECTABLE_TYPES } from "../../../../src/injectable-types";
import { ServerConfigRepository, UserRepository } from "../../../../src/types";
import { FilterCondition } from "../../../../src/dal/filter-condition";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";

process.env.TEST_SUITE = "server-mutations-test";

describe("server mutations", () => {
	let {
		mutate,
		server,
		mockSessionContextFactory,
		otherUser,
		otherUserSecurityContext,
		world,
		testRole,
		currentUser,
		testerSecurityContext,
		newFolder,
		...testingContext
	} = defaultTestingContextFactory();

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

		test("unlock", async (done) => {
			const result = await mutate({
				mutation: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					unlockServer: true,
				},
				errors: undefined,
			});
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
			mockSessionContextFactory.setCurrentUser(
				await userRepository.findOne([new FilterCondition("username", "tester")])
			);
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
				errors: undefined,
			});
		});
	});
});
