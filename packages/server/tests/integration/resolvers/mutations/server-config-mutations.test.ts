import { container } from "../../../../src/di/inversify.js";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types.js";
import {DbEngine} from "../../../../src/types.js";
import {DefaultTestingContext} from "../../default-testing-context.js";
import {GENERATE_REGISTER_CODES, SET_DEFAULT_WORLD, UNLOCK_SERVER} from "@rpgtools/common/src/gql-mutations.js";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types.js";
import { SERVER_ADMIN_ROLE } from "@rpgtools/common/src/permission-constants.js";
import { ServerConfigService } from "src/services/server-config-service.js";

process.env.TEST_SUITE = "server-mutations-test";

describe("server mutations", () => {
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	beforeEach(async() => {
		await testingContext.reset();
		testingContext.mockSessionContextFactory.setCurrentUser(testingContext.tester2);
	});

	describe("with locked server", () => {
		const adminUserEmail = "tester@gmail.com";
		const adminUsername = "tester";
		const adminPassword = "tester";

		const unlockCode = "asdf";

		const lockServer = async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			const adminRole = await databaseContext.roleRepository.findOneByName(SERVER_ADMIN_ROLE);
			if (adminRole) {
				await databaseContext.roleRepository.delete(adminRole);
			}
			const adminUser = await databaseContext.userRepository.findOneByUsername(adminUsername);
			if (adminUser) {
				await databaseContext.userRepository.delete(adminUser);
			}
			const serverConfig = await databaseContext.serverConfigRepository.findOne();
			serverConfig.unlockCode = unlockCode;
			serverConfig.adminUsers = [];
			await databaseContext.serverConfigRepository.update(serverConfig);
		};

		beforeEach(async () => {
			await lockServer();
		});

		afterEach(async () => {
			await lockServer();
			const databaseContext = await dbEngine.createDatabaseContext();
			const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
			const serverConfig = await service.getServerConfig(databaseContext);
			await service.unlockServer(serverConfig.unlockCode, adminUserEmail, adminUsername, adminPassword, databaseContext);
			await testingContext.reset();
		});

		test("unlock", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: unlockCode,
					email: adminUserEmail,
					username: adminUsername,
					password: adminPassword,
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
			const firstResult = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: unlockCode,
					email: adminUserEmail,
					username: adminUsername,
					password: adminPassword,
				},
			});
			expect(firstResult).toMatchSnapshot({
				data: {
					unlockServer: true,
				},
				errors: undefined,
			});
			const secondResult = await testingContext.server.executeGraphQLQuery({
				query: UNLOCK_SERVER,
				variables: {
					unlockCode: unlockCode,
					email: adminUserEmail,
					username: adminUsername,
					password: adminPassword,
				},
			});
			expect(secondResult).toMatchSnapshot();
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
			const databaseContext = await dbEngine.createDatabaseContext();
			testingContext.mockSessionContextFactory.setCurrentUser(
				await databaseContext.userRepository.findOneByUsername("tester")
			);
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
						_id: expect.any(String),
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
