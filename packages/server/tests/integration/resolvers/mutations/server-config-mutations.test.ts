import { container } from "../../../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import {DbEngine, Factory} from "../../../../src/types";
import {DefaultTestingContext} from "../../default-testing-context";
import {GENERATE_REGISTER_CODES, SET_DEFAULT_WORLD, UNLOCK_SERVER} from "@rpgtools/common/src/gql-mutations";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {DatabaseContext} from "../../../../src/dal/database-context";

process.env.TEST_SUITE = "server-mutations-test";

describe("server mutations", () => {
	const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	beforeEach(async() => {
		await testingContext.reset();
		testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);
	});

	describe("with locked server", () => {
		const resetConfig = async () => {
			const session = await dbEngine.createDatabaseSession();
			const databaseContext = databaseContextFactory({session});
			const serverConfig = await databaseContext.serverConfigRepository.findOne();
			serverConfig.unlockCode = "asdf";
			serverConfig.adminUsers = [];
			await databaseContext.serverConfigRepository.update(serverConfig);
			await session.commit();
		};
		beforeEach(async () => {
			await resetConfig();
		});

		afterEach(async () => {
			await resetConfig();
		});

		test("unlock", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
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
		});

		test("unlock twice", async () => {
			await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: "asdf",
					email: "zach@thezachcave.com",
					username: "otherTester",
					password: "zach",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
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
		const result = await testingContext.server.executeGraphQLQuery({
			query: GENERATE_REGISTER_CODES,
			variables: { amount: 10 },
		});
		expect(result).toMatchSnapshot();
	});

	test("set default world no permission", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: SET_DEFAULT_WORLD,
			variables: { worldId: testingContext.world._id },
		});
		expect(result).toMatchSnapshot();
	});

	describe("with authenticated user", () => {
		beforeEach(async () => {
			const session = await dbEngine.createDatabaseSession();
			const databaseContext = databaseContextFactory({session});
			testingContext.mockSessionContextFactory.setCurrentUser(
				await databaseContext.userRepository.findOneByUsername("tester")
			);
			await session.commit();
		});

		test("generate register codes", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GENERATE_REGISTER_CODES,
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

		test("set default world", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: SET_DEFAULT_WORLD,
				variables: { worldId: testingContext.world._id },
			});
			expect(result).toMatchSnapshot({
				data: {
					setDefaultWorld: {
						defaultWorld: {
							_id: expect.any(String),
							name: expect.any(String),
							wikiPage: {
								_id: expect.any(String)
							}
						}
					}
				},
				errors: undefined
			});
		});
	});
});
