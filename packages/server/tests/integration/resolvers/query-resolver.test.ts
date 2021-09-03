import { GET_CURRENT_WORLD } from "../../../../frontend/src/hooks/world/useCurrentWorld";
import { SEARCH_USERS } from "../../../../frontend/src/hooks/authentication/useSearchUsers";
import { GET_WORLDS } from "../../../../frontend/src/hooks/world/useWorlds";
import { GET_CURRENT_WIKI } from "../../../../frontend/src/hooks/wiki/useCurrentWiki";
import { GET_CURRENT_USER } from "../../../../common/src/queries";
import { defaultTestingContextFactory } from "../DefaultTestingContextFactory";
import { container } from "../../../src/inversify";
import { INJECTABLE_TYPES } from "../../../src/injectable-types";
import { WorldService } from "../../../src/types";
import { ANON_USERNAME } from "../../../../common/src/permission-constants";

process.env.TEST_SUITE = "query-resolver-test";

describe("query resolver", () => {
	const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
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
		...testingContext
	} = defaultTestingContextFactory();

	describe("with world", () => {
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
			} = await testingContext.reset());
			mockSessionContextFactory.resetCurrentUser();
		});

		test("no current user", async () => {
			const result = await server.executeGraphQLQuery({ query: GET_CURRENT_USER });
			expect(result).toMatchSnapshot({
				data: {
					currentUser: {
						username: ANON_USERNAME,
					},
				},
				errors: undefined,
			});
		});

		test("users", async () => {
			const result = await server.executeGraphQLQuery({
				query: SEARCH_USERS,
				variables: { username: "tester2" },
			});
			expect(result).toMatchSnapshot({
				data: {
					users: {
						docs: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
							}),
						]),
					},
				},
				errors: undefined,
			});
		});

		test("world", async () => {
			const result = await server.executeGraphQLQuery({
				query: GET_CURRENT_WORLD,
				variables: { worldId: world._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		test("worlds with one private and one public world", async () => {
			await worldService.createWorld("Azeroth", true, testerSecurityContext);
			const result = await server.executeGraphQLQuery({
				query: GET_WORLDS,
				variables: { page: 1 },
			});
			expect(result).toMatchSnapshot({
				data: {
					worlds: {
						docs: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								wikiPage: expect.objectContaining({
									_id: expect.any(String),
								}),
							}),
						]),
					},
				},
				errors: undefined,
			});
		});

		test("wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: GET_CURRENT_WIKI,
				variables: { wikiId: world.wikiPage },
			});
			expect(result).toMatchSnapshot({
				errors: [
					{
						message: expect.any(String),
					},
				],
			});
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				mockSessionContextFactory.setCurrentUser(currentUser);
			});

			test("current user", async () => {
				const result = await server.executeGraphQLQuery({ query: GET_CURRENT_USER });
				expect(result).toMatchSnapshot({
					data: {
						currentUser: {
							_id: expect.any(String),
							roles: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
								}),
							]),
						},
					},
					errors: undefined,
				});
			});

			test("world", async () => {
				const result = await server.executeGraphQLQuery({
					query: GET_CURRENT_WORLD,
					variables: { worldId: world._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						world: {
							_id: expect.any(String),
							roles: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									members: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
											username: expect.any(String),
										}),
									]),
									permissions: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
											subject: expect.objectContaining({
												_id: expect.any(String),
											}),
										}),
									]),
								}),
							]),
							rootFolder: {
								_id: expect.any(String),
								children: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								]),
							},
							wikiPage: {
								_id: expect.any(String),
							},
							accessControlList: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									subject: expect.objectContaining({
										_id: expect.any(String),
									}),
									roles: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
								}),
							]),
							pins: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									map: expect.objectContaining({
										_id: expect.any(String),
									}),
									page: expect.objectContaining({
										_id: expect.any(String),
									}),
								}),
							]),
						},
					},
					errors: undefined,
				});
			});

			test("worlds with one private and one public world", async () => {
				await worldService.createWorld("Azeroth", false, testerSecurityContext);
				const result = await server.executeGraphQLQuery({
					query: GET_WORLDS,
					variables: { page: 1 },
				});
				expect(result).toMatchSnapshot({
					data: {
						worlds: {
							docs: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									wikiPage: expect.objectContaining({
										_id: expect.any(String),
									}),
								}),
							]),
						},
					},
					errors: undefined,
				});
			});

			test("wiki", async () => {
				const result = await server.executeGraphQLQuery({
					query: GET_CURRENT_WIKI,
					variables: { wikiId: world.wikiPage },
				});
				expect(result).toMatchSnapshot({
					data: {
						wiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
							folder: {
								_id: expect.any(String),
							},
						},
					},
					errors: undefined,
				});
			});
		});
	});
});
