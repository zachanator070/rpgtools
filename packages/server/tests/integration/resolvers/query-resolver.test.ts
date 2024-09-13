import {DefaultTestingContext} from "../default-testing-context.js";
import { container } from "../../../src/di/inversify.js";
import { INJECTABLE_TYPES } from "../../../src/di/injectable-types.js";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import {
	GET_CURRENT_USER,
	GET_WIKI,
	GET_CURRENT_WORLD,
	GET_WORLDS, SEARCH_ROLES,
	SEARCH_USERS,
	WIKIS_IN_FOLDER, GET_GAME, MY_GAMES, SEARCH_EVENTS
} from "@rpgtools/common/src/gql-queries";
import {WorldService} from "../../../src/services/world-service.js";
import {WikiFolderService} from "../../../src/services/wiki-folder-service.js";
import {TEST_INJECTABLE_TYPES} from "../injectable-types.js";
import {DbEngine} from "../../../src/types";
import {accessControlList} from "./common-testing-assertions.js";

process.env.TEST_SUITE = "query-resolver-test";

describe("query resolver", () => {
	const worldService = container.get<WorldService>(INJECTABLE_TYPES.WorldService);
	const wikiFolderService = container.get<WikiFolderService>(INJECTABLE_TYPES.WikiFolderService);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);

	describe("with world", () => {
		beforeEach(async () => {
			await testingContext.reset();
			testingContext.mockSessionContextFactory.useAnonUser();
		});

		test("no current user", async () => {
			const result = await testingContext.server.executeGraphQLQuery({ query: GET_CURRENT_USER });
			expect(result).toMatchSnapshot({
				data: {
					currentUser: {
						_id: expect.any(String),
						username: ANON_USERNAME,
					},
				},
				errors: undefined,
			});
		});

		test("users", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
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
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_CURRENT_WORLD,
				variables: { worldId: testingContext.world._id.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		test("worlds with one private and one public world", async () => {
			const databaseContext = await dbEngine.createDatabaseContext();
			await worldService.createWorld("Azeroth", true, testingContext.tester1SecurityContext, databaseContext);
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_WORLDS,
				variables: { page: 1 },
			});
			expect(result).toMatchSnapshot({
				data: {
					worlds: expect.objectContaining({
						docs: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								wikiPage: expect.objectContaining({
									_id: expect.any(String),
								}),
							}),
						]),
					}),
				},
				errors: undefined,
			});
		});

		test("wiki no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: GET_WIKI,
				variables: { wikiId: testingContext.world.wikiPage },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([
					expect.objectContaining({
						message: expect.any(String),
					}),
				]),
			});
		});

		describe('with hosted game', () => {

			beforeEach(async () => {
				await testingContext.setupGame();
			});

			it('get a game permission denied', async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: GET_GAME,
					variables: {
						gameId: testingContext.game._id,
					},
				});
				expect(result).toMatchSnapshot({
					errors: expect.any(Array)
				});
			});
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				testingContext.mockSessionContextFactory.setCurrentUser(testingContext.currentUser);
			});

			test("current user", async () => {
				const result = await testingContext.server.executeGraphQLQuery({ query: GET_CURRENT_USER });
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
				const result = await testingContext.server.executeGraphQLQuery({
					query: GET_CURRENT_WORLD,
					variables: { worldId: testingContext.world._id.toString() },
				});
				expect(result).toMatchSnapshot({
					data: {
						world: {
							_id: expect.any(String),
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
							accessControlList: accessControlList
						},
					},
					errors: undefined,
				});
			});

			test("worlds with one private and one public world", async () => {
				const databaseContext = await dbEngine.createDatabaseContext();
				await worldService.createWorld("Azeroth", false, testingContext.tester1SecurityContext, databaseContext);
				const result = await testingContext.server.executeGraphQLQuery({
					query: GET_WORLDS,
					variables: { page: 1 },
				});
				expect(result).toMatchSnapshot({
					data: {
						worlds: expect.objectContaining({
							docs: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									wikiPage: expect.objectContaining({
										_id: expect.any(String),
									}),
								}),
							]),
						}),
					},
					errors: undefined,
				});
			});

			test("wiki", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: GET_WIKI,
					variables: { wikiId: testingContext.world.wikiPage },
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

			test("wikis in folder", async () => {
				const databaseContext = await dbEngine.createDatabaseContext();
				const placesFolder = (await wikiFolderService.getFolders(testingContext.tester1SecurityContext, testingContext.world._id, "Places", undefined, databaseContext)).filter(folder => folder.name === "Places");
				const result = await testingContext.server.executeGraphQLQuery({
					query: WIKIS_IN_FOLDER,
					variables: { folderId: placesFolder[0]._id},
				});
				expect(result).toMatchSnapshot({
					data: {
						wikisInFolder: {
							docs: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String)
								})
							]),
							nextPage: null
						}
					},
					errors: undefined
				})
			});

			it("get roles", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: SEARCH_ROLES,
					variables: {
						worldId: testingContext.world._id,
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						roles: {
							docs: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									accessControlList: expect.any(Array),
									members: expect.any(Array),
									world: {
										_id: expect.any(String)
									}
								}),
							])
						}
					},
					errors: undefined
				});
			});

			it("get roles permission denied", async () => {
				testingContext.mockSessionContextFactory.useAnonUser();
				const result = await testingContext.server.executeGraphQLQuery({
					query: SEARCH_ROLES,
					variables: {
						worldId: testingContext.world._id,
					},
				});
				expect(result).toMatchSnapshot();
			});

			describe('with hosted game', () => {

				beforeEach(async () => {
					await testingContext.setupGame();
				});

				it('get a game', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: GET_GAME,
						variables: {
							gameId: testingContext.game._id,
						},
					});
					expect(result).toMatchSnapshot({
						data: {
							game: expect.objectContaining({
								_id: expect.any(String),
								characters: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
										name: testingContext.tester1.username
									}),
								])
							})
						},
						errors: undefined
					});
				});

				it('get my games', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: MY_GAMES,
					});
					expect(result).toMatchSnapshot({
						data: {
							myGames: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
								}),
							])
						},
						errors: undefined
					});
				});
			})

			describe ('with multiple events, calendars, and referenced wikis', () => {

				beforeEach(async () => {
					await testingContext.setupEvents();
				});

				it('get all events', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: SEARCH_EVENTS,
						variables: {
							worldId: testingContext.world._id
						}
					});
					expect(result.errors).toBeUndefined();
					expect(result).toMatchSnapshot({
						data: {
							events: {
								docs: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								])
							}
						},
						errors: undefined
					});
					expect(result.data && result.data.events.docs.length).toBe(5);
				});

				it('get all events in second calendar', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: SEARCH_EVENTS,
						variables: {
							worldId: testingContext.world._id,
							calendarIds: [testingContext.calendar2._id]
						}
					});
					expect(result.errors).toBeUndefined();
					expect(result).toMatchSnapshot({
						data: {
							events: {
								docs: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								])
							}
						},
						errors: undefined
					});
					expect(result.data && result.data.events.docs.length).toBe(2);
				});

				it('get only events related to world wiki page', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: SEARCH_EVENTS,
						variables: {
							worldId: testingContext.world._id,
							relatedWikiIds: [testingContext.world.wikiPage]
						}
					});
					expect(result.errors).toBeUndefined();
					expect(result).toMatchSnapshot({
						data: {
							events: {
								docs: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								])
							}
						},
						errors: undefined
					});
					expect(result.data && result.data.events.docs.length).toBe(3);
				});

				it('get only events related to world wiki page in second calendar', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: SEARCH_EVENTS,
						variables: {
							worldId: testingContext.world._id,
							relatedWikiIds: [testingContext.world.wikiPage],
							calendarIds: [testingContext.calendar2._id]
						}
					});
					expect(result.errors).toBeUndefined();
					expect(result).toMatchSnapshot({
						data: {
							events: {
								docs: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									}),
								])
							}
						},
						errors: undefined
					});
					expect(result.data && result.data.events.docs.length).toBe(1);
				});
			})
		});
	});
});
