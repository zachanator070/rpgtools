import { CREATE_WORLD } from "../../../../../frontend/src/hooks/world/useCreateWorld";
import { DELETE_PIN } from "../../../../../frontend/src/hooks/map/useDeletePin";
import { RENAME_WORLD } from "../../../../../frontend/src/hooks/world/useRenameWorld";
import { UPDATE_PIN } from "../../../../../frontend/src/hooks/map/useUpdatePin";
import { defaultTestingContextFactory } from "../../DefaultTestingContextFactory";
import { CREATE_PIN } from "../../../../../frontend/src/hooks/map/useCreatePin";

process.env.TEST_SUITE = "world-mutations-test";

describe("world-mutations", () => {
	describe("with world and logged in", () => {
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
			otherPage,
			pin,
			...testingContext
		} = defaultTestingContextFactory();

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
				otherPage,
				pin,
			} = await testingContext.reset());
		});

		test("create world", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_WORLD,
				variables: { name: "Earth", public: false },
			});
			expect(result).toMatchSnapshot({
				data: {
					createWorld: {
						_id: expect.any(String),
						wikiPage: {
							_id: expect.any(String),
						},
					},
				},
				errors: undefined,
			});
		});

		test("rename world", async () => {
			const result = await server.executeGraphQLQuery({
				query: RENAME_WORLD,
				variables: { worldId: world._id, newName: "Azeroth" },
			});
			expect(result).toMatchSnapshot({
				data: {
					renameWorld: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		test("create pin", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_PIN,
				variables: {
					mapId: world.wikiPage,
					x: 0,
					y: 0,
					wikiId: world.wikiPage,
				},
			});
			expect(result).toMatchSnapshot({
				data: {
					createPin: {
						_id: expect.any(String),
						pins: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								map: {
									_id: expect.any(String),
									name: expect.any(String),
								},
								page: {
									_id: expect.any(String),
									name: expect.any(String),
									type: expect.any(String),
								},
								x: 0,
								y: 0,
							}),
						]),
					},
				},
				errors: undefined,
			});
		});

		test("update pin", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_PIN,
				variables: { pinId: pin._id, pageId: otherPage._id },
			});
			expect(result).toMatchSnapshot({
				data: {
					updatePin: {
						_id: expect.any(String),
						pins: [
							{
								_id: expect.any(String),
								map: {
									_id: expect.any(String),
								},
								page: {
									_id: expect.any(String),
								},
							},
						],
					},
				},
				errors: undefined,
			});
		});

		test("delete pin", async () => {
			const result = await server.executeGraphQLQuery({
				query: DELETE_PIN,
				variables: { pinId: pin._id },
			});
			expect(result).toMatchSnapshot({
				data: {
					deletePin: {
						_id: expect.any(String),
					},
				},
				errors: undefined,
			});
		});

		describe("not logged in", () => {
			beforeEach(() => {
				mockSessionContextFactory.resetCurrentUser();
			});
			test("create world no permissions", async () => {
				const result = await server.executeGraphQLQuery({
					query: CREATE_WORLD,
					variables: { name: "Earth", public: false },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("rename world no permission", async () => {
				const result = await server.executeGraphQLQuery({
					query: RENAME_WORLD,
					variables: { worldId: world._id, newName: "Azeroth" },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("create pin no permission", async () => {
				const result = await server.executeGraphQLQuery({
					query: CREATE_PIN,
					variables: {
						mapId: world.wikiPage,
						x: 0,
						y: 0,
						wikiId: world.wikiPage,
					},
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("update pin no permission", async () => {
				const result = await server.executeGraphQLQuery({
					query: UPDATE_PIN,
					variables: { pinId: pin._id, pageId: otherPage._id },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});

			test("delete pin no permission", async () => {
				const result = await server.executeGraphQLQuery({
					query: DELETE_PIN,
					variables: { pinId: pin._id },
				});
				expect(result).toMatchSnapshot({
					errors: expect.arrayContaining([expect.any(Object)]),
				});
			});
		});
	});
});
