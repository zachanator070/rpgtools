import { createTestClient } from "apollo-server-testing";
import { LOGIN_QUERY } from "../../../../../frontend/src/hooks/authentication/useLogin";
import { REGISTER_MUTATION } from "../../../../../frontend/src/hooks/authentication/useRegister";
import { container } from "../../../../src/inversify.config";
import { ServerConfigRepository, SessionContextFactory } from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/injectable-types";
import { MockSessionContextFactory } from "../../MockSessionContextFactory";
import { ExpressApiServer } from "../../../../src/express-api-server";

process.env.TEST_SUITE = "authentication-mutations-test";

describe("authentication-mutations", () => {
	container
		.rebind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
		.to(MockSessionContextFactory)
		.inSingletonScope();

	const server: ExpressApiServer = container.get<ExpressApiServer>(INJECTABLE_TYPES.ApiServer);

	const { mutate } = createTestClient(server.gqlServer);

	test("login", async () => {
		const result = await mutate({
			mutation: LOGIN_QUERY,
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
		const result = await mutate({
			mutation: LOGIN_QUERY,
			variables: { username: "tester", password: "asdf" },
		});
		expect(result).toMatchSnapshot();
	});

	test("login bad username", async () => {
		const result = await mutate({
			mutation: LOGIN_QUERY,
			variables: { username: "tester", password: "asdf" },
		});
		expect(result).toMatchSnapshot();
	});

	describe("with good register code available", () => {
		beforeEach(async () => {
			const repo = container.get<ServerConfigRepository>(INJECTABLE_TYPES.ServerConfigRepository);
			const serverConfig = await repo.findOne();
			serverConfig.registerCodes.push("asdf");
			await repo.update(serverConfig);
		});

		test("register good", async () => {
			const result = await mutate({
				mutation: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
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
			await mutate({
				mutation: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await mutate({
				mutation: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("register use email twice", async () => {
			await mutate({
				mutation: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await mutate({
				mutation: REGISTER_MUTATION,
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
			await mutate({
				mutation: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "tester2@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await mutate({
				mutation: REGISTER_MUTATION,
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
		const result = await mutate({
			mutation: REGISTER_MUTATION,
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
