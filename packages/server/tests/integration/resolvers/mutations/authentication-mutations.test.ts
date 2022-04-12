import { container } from "../../../../src/di/inversify";
import { ServerConfigRepository } from "../../../../src/types";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";
import {gql} from "graphql-tag";

process.env.TEST_SUITE = "authentication-mutations-test";

export const REGISTER_MUTATION = gql`
	mutation register(
		$registerCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		register(
			registerCode: $registerCode
			email: $email
			username: $username
			password: $password
		) {
			_id
		}
	}
`;

export const LOGIN_QUERY = gql`
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			_id
		}
	}
`;

describe("authentication-mutations", () => {
	let {
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

	test("login", async () => {
		const result = await server.executeGraphQLQuery({
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
		const result = await server.executeGraphQLQuery({
			query: LOGIN_QUERY,
			variables: { username: "tester", password: "asdf" },
		});
		expect(result).toMatchSnapshot();
	});

	test("login bad username", async () => {
		const result = await server.executeGraphQLQuery({
			query: LOGIN_QUERY,
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
			const result = await server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
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
			await server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
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
			await server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "asdf@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await server.executeGraphQLQuery({
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
			await server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					registerCode: "asdf",
					email: "tester2@gmail.com",
					username: "tester2",
					password: "tester",
				},
			});
			const result = await server.executeGraphQLQuery({
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
		const result = await server.executeGraphQLQuery({
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
