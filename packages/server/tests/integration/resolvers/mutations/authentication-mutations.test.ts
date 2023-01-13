import { container } from "../../../../src/di/inversify";
import {DbEngine, Factory} from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import {DefaultTestingContext} from "../../default-testing-context";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {LOGIN_QUERY, REGISTER_MUTATION} from "@rpgtools/common/src/gql-mutations";
import {DatabaseContext} from "../../../../src/dal/database-context";

process.env.TEST_SUITE = "authentication-mutations-test";

describe("authentication-mutations", () => {
	const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	beforeEach(async () => {
		await testingContext.reset();
	});

	test("login", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: LOGIN_QUERY,
			variables: { username: "tester", password: "tester" },
		});
		expect(result).toMatchSnapshot({
			data: {
				login: {
					_id: expect.any(String),
				},
			},
			errors: undefined,
		});
	});

	test("login bad password", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: LOGIN_QUERY,
			variables: { username: "tester", password: "asdf" },
		});
		expect(result).toMatchSnapshot();
	});

	test("login bad username", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: LOGIN_QUERY,
			variables: { username: "tester", password: "asdf" },
		});
		expect(result).toMatchSnapshot();
	});

	describe("with good register code available", () => {

		beforeEach(async () => {
			const session = await dbEngine.createDatabaseSession();
			const databaseContext = databaseContextFactory({session})
			const serverConfig = await databaseContext.serverConfigRepository.findOne();
			serverConfig.registerCodes.push("asdf");
			await databaseContext.serverConfigRepository.update(serverConfig);
			await session.commit();
		});

		test("register good", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester3",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					register: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("register use code twice", async () => {
			const firstResult = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "tester4@gmail.com",
					username: "tester4",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "tester5@gmail.com",
					username: "tester5",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("register use email twice", async () => {
			await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "qwerty",
					email: "asdf@gmail.com",
					username: "tester3",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("register use username twice", async () => {
			await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "tester2@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "qwerty",
					email: "tester3@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot();
		});
	});

	test("register bad code", async () => {
		const result = await testingContext.server.executeGraphQLQuery({
			query: REGISTER_MUTATION,
			variables: {
				registerCode: "1234",
				email: "asdf@gmail.com",
				username: "tester2",
				password: "tester",
			},
		});
		expect(result).toMatchSnapshot();
	});
});
