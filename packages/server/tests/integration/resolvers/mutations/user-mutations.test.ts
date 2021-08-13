import { SET_CURRENT_WORLD } from "../../../../../frontend/src/hooks/world/useSetCurrentWorld";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";

process.env.TEST_SUITE = "user-mutations-test";

describe("user mutations", () => {
	let {
		mutate,
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

	describe("with world and not logged in", () => {
		beforeEach(async () => {
			({
				mockSessionContextFactory,
				otherUser,
				otherUserSecurityContext,
				world,
				testRole,
				currentUser,
				testerSecurityContext,
				newFolder,
			} = await testingContext.reset());
			mockSessionContextFactory.resetCurrentUser();
		});

		test("set current world not logged in", async () => {
			const result = await mutate({
				mutation: SET_CURRENT_WORLD,
				variables: { worldId: world._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				mockSessionContextFactory.setCurrentUser(currentUser);
			});

			test("set current world", async () => {
				const result = await mutate({
					mutation: SET_CURRENT_WORLD,
					variables: { worldId: world._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						setCurrentWorld: {
							_id: expect.any(String),
						},
					},
				});
			});
		});
	});
});
