import {DefaultTestingContext} from "../../default-testing-context.js";
import {SET_CURRENT_WORLD} from "@rpgtools/common/src/gql-mutations";
import {container} from "../../../../src/di/inversify.js";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types.js";

process.env.TEST_SUITE = "user-mutations-test";

describe("user mutations", () => {
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	describe("with world and not logged in", () => {
		beforeEach(async () => {
			await testingContext.reset();
			testingContext.mockSessionContextFactory.useAnonUser();
		});

		test("set current world not logged in", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: SET_CURRENT_WORLD,
				variables: { worldId: testingContext.world._id.toString() },
			});
			expect(result).toMatchSnapshot({
				data: {
					setCurrentWorld: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				testingContext.mockSessionContextFactory.setCurrentUser(testingContext.currentUser);
			});

			test("set current world", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: SET_CURRENT_WORLD,
					variables: { worldId: testingContext.world._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						setCurrentWorld: {
							_id: expect.any(String),
						},
					},
					errors: undefined,
				});
			});
		});
	});
});
