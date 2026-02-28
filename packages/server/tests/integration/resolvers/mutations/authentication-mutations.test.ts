import { container } from "../../../../src/di/inversify.js";
import {DbEngine} from "../../../../src/types.js";
import { INJECTABLE_TYPES } from "../../../../src/di/injectable-types.js";
import {DefaultTestingContext} from "../../default-testing-context.js";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types.js";
import {LOGIN_QUERY, REGISTER_MUTATION} from "@rpgtools/common/src/gql-mutations.js";
import InviteFactory from "../../../../src/domain-entities/factory/invite-factory.js";
import {ServerProperties} from "../../../../src/server/server-properties.js";
import {v4 as uuidv4} from "uuid";

process.env.TEST_SUITE = "authentication-mutations-test";

describe("authentication-mutations", () => {
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);
	const serverProperties = container.get<ServerProperties>(INJECTABLE_TYPES.ServerProperties);
	const originalGoogleClientId = serverProperties.googleClientId;
	const originalGoogleClientSecret = serverProperties.googleClientSecret;

	beforeEach(async () => {
		await testingContext.reset();
		serverProperties.googleClientId = originalGoogleClientId;
		serverProperties.googleClientSecret = originalGoogleClientSecret;
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

	describe("with invite emails available", () => {
		let inviteEmail1: string;
		let inviteEmail2: string;
		let inviteEmail3: string;

		beforeEach(async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			const inviteFactory = container.get<InviteFactory>(INJECTABLE_TYPES.InviteFactory);
			inviteEmail1 = `invite-user-1-${uuidv4()}@example.com`;
			inviteEmail2 = `invite-user-2-${uuidv4()}@example.com`;
			inviteEmail3 = `invite-user-3-${uuidv4()}@example.com`;
			await databaseContext.inviteRepository.create(inviteFactory.build({ email: inviteEmail1 }));
			await databaseContext.inviteRepository.create(inviteFactory.build({ email: inviteEmail2 }));
			await databaseContext.inviteRepository.create(inviteFactory.build({ email: inviteEmail3 }));
		});

		test("register good", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					email: inviteEmail1,
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
					email: inviteEmail2,
					username: "tester4",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
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
					email: inviteEmail3,
					username: "tester2",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					email: inviteEmail3,
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
					email: inviteEmail1,
					username: "tester2",
					password: "tester",
				},
			});
			const result = await testingContext.server.executeGraphQLQuery({
				query: REGISTER_MUTATION,
				variables: {
					email: inviteEmail2,
					username: "tester2",
					password: "tester",
				},
			});
			expect(result).toMatchSnapshot();
		});
	});

	test("register without invite", async () => {
		const email = `not-invited-${uuidv4()}@example.com`;
		const result = await testingContext.server.executeGraphQLQuery({
			query: REGISTER_MUTATION,
			variables: {
				email,
				username: "tester2",
				password: "tester",
			},
		});
		expect(result.errors?.[0]?.message).toEqual("Registration Error: No invite exists for this email");
		expect(result.data).toBeNull();
	});

	test("register works when sso configured", async () => {
		const databaseContext = await dbEngine.createDatabaseContext();
		const inviteFactory = container.get<InviteFactory>(INJECTABLE_TYPES.InviteFactory);
		await databaseContext.inviteRepository.create(inviteFactory.build({ email: "sso-user@gmail.com" }));

		serverProperties.googleClientId = "google-client-id";
		serverProperties.googleClientSecret = "google-client-secret";

		const result = await testingContext.server.executeGraphQLQuery({
			query: REGISTER_MUTATION,
			variables: {
				email: "sso-user@gmail.com",
				username: "sso-user",
				password: "tester",
			},
		});

		expect(result.errors).toBeUndefined();
		expect(result.data?.register?._id).toEqual(expect.any(String));
	});
});
