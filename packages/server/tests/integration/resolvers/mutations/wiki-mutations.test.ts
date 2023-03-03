import fs from "fs";
import {ARTICLE, EVENT_WIKI, PLACE} from "@rpgtools/common/src/type-constants";
import {DefaultTestingContext} from "../../default-testing-context";
import {container} from "../../../../src/di/inversify";
import {INJECTABLE_TYPES} from "../../../../src/di/injectable-types";
import {Image} from "../../../../src/domain-entities/image";
import {FileUpload, Upload} from "graphql-upload";
import {CREATE_WIKI, DELETE_WIKI, UPDATE_EVENT, UPDATE_PLACE, UPDATE_WIKI} from "@rpgtools/common/src/gql-mutations";
import {ImageService} from "../../../../src/services/image-service";
import {DbEngine, Factory} from "../../../../src/types";
import {TEST_INJECTABLE_TYPES} from "../../injectable-types";
import {DatabaseContext} from "../../../../src/dal/database-context";
import {EventWiki} from "../../../../src/domain-entities/event-wiki";
import {WikiPageService} from "../../../../src/services/wiki-page-service";

process.env.TEST_SUITE = "wiki-mutations-test";

describe("wiki page mutations", () => {
	const imageService = container.get<ImageService>(INJECTABLE_TYPES.ImageService);
	const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
	const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
	const testingContext = container.get<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext);
	const wikiPageService = container.get<WikiPageService>(INJECTABLE_TYPES.WikiPageService);


	describe("with world", () => {
		beforeEach(async () => {
			await testingContext.reset();
			testingContext.mockSessionContextFactory.useAnonUser();
		});

		test("create wiki no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: CREATE_WIKI,
				variables: { name: "new wiki", folderId: testingContext.world.rootFolder.toString() },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update wiki no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: { wikiId: testingContext.world.wikiPage, name: "new name" },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update cover image no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: {
					wikiId: testingContext.world.wikiPage,
					coverImageId: "12345",
				},
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("delete wiki no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: DELETE_WIKI,
				variables: { wikiId: testingContext.world.wikiPage},
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update place no permission", async () => {
			const result = await testingContext.server.executeGraphQLQuery({
				query: UPDATE_PLACE,
				variables: { placeId: testingContext.world.wikiPage, mapImageId: null },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		describe("with authenticated user", () => {

			beforeEach(async () => {
				testingContext.mockSessionContextFactory.setCurrentUser(testingContext.currentUser);
			});

			test("create wiki", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: CREATE_WIKI,
					variables: {
						name: "new wiki",
						folderId: testingContext.world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						createWiki: {
							_id: expect.any(String),
							name: expect.any(String),
							canWrite: true,
							canAdmin: true,
							children: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
								})
							]),
						},
					},
					errors: undefined
				});
			});

			test("update wiki just name", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: testingContext.world.wikiPage,
						name: "new name",
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							folder: {
								_id: expect.any(String)
							},
							world: {
								_id: expect.any(String),
							},
						},
					},
					errors: undefined
				});
			});

			test("update wiki just content", async () => {
				const content: FileUpload = {
					mimetype: "text",
					encoding: "utf8",
					filename: "content.txt",
					createReadStream: () => fs.createReadStream("tests/integration/resolvers/mutations/testcontent.txt")
				};

				const testUpload = new Upload();
				testUpload.file = content;
				testUpload.promise = new Promise<FileUpload>((resolve) => {
					resolve(content);
				});
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: testingContext.world.wikiPage,
						content: testUpload,
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
							folder: {
								_id: expect.any(String)
							},
							content: expect.any(String),
						},
					},
					errors: undefined
				});
			});


			test("update type", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: { wikiId: testingContext.otherPage._id, type: PLACE },
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
							folder: {
								_id: expect.any(String)
							},
						},
					},
					errors: undefined
				});
			});

			test("delete wiki root wiki", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: DELETE_WIKI,
					variables: { wikiId: testingContext.world.wikiPage },
				});
				expect(result).toMatchSnapshot();
			});

			test("delete wiki", async () => {
				const result = await testingContext.server.executeGraphQLQuery({
					query: DELETE_WIKI,
					variables: { wikiId: testingContext.otherPage._id },
				});
				expect(result).toMatchSnapshot({
					data: {
						deleteWiki: {
							_id: expect.any(String),
						},
					},
					errors: undefined
				});
			});

			describe("with image", () => {
				const filename = "tests/integration/resolvers/mutations/testmap.png";
				let testFile = {
					filename,
					createReadStream: () =>
						fs.createReadStream(filename),
				};
				let image: Image = null;
				beforeEach(async () => {
					const session = await dbEngine.createDatabaseSession();
					const databaseContext = databaseContextFactory({session});
					image = await imageService.createImage(testingContext.world._id, false, testFile.filename, testFile.createReadStream(), databaseContext);
					await session.commit();
				});

				test("update place", async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: UPDATE_PLACE,
						variables: {
							placeId: testingContext.world.wikiPage,
							mapImageId: image._id,
						},
					});
					expect(result).toMatchSnapshot({
						data: {
							updatePlace: {
								_id: expect.any(String),
								mapImage: {
									_id: expect.any(String),
									chunks: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
											fileId: expect.any(String),
										}),
									]),
									icon: {
										_id: expect.any(String),
										chunks: expect.arrayContaining([
											expect.objectContaining({
												_id: expect.any(String),
												fileId: expect.any(String),
											}),
										]),
									},
								},
							},
						},
						errors: undefined
					});
				});


				test("update cover image", async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: UPDATE_WIKI,
						variables: {
							wikiId: testingContext.world.wikiPage,
							coverImageId: image._id
						},
					});
					expect(result).toMatchSnapshot({
						data: {
							updateWiki: {
								_id: expect.any(String),
								world: {
									_id: expect.any(String),
								},
								folder: {
									_id: expect.any(String)
								},
								coverImage: {
									_id: expect.any(String),
									chunks: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
											fileId: expect.any(String),
										}),
									]),
									icon: {
										_id: expect.any(String),
										chunks: expect.arrayContaining([
											expect.objectContaining({
												_id: expect.any(String),
												fileId: expect.any(String),
											}),
										]),
									},
								},
							},
						},
						errors: undefined
					});
				});
			});

			describe('with new event wiki', () => {
				let eventId: string = null;
				beforeEach(async () => {
					const session = await dbEngine.createDatabaseSession();
					const databaseContext = databaseContextFactory({session});
					if(eventId) {
						await wikiPageService.deleteWiki(testingContext.currentUserSecurityContext, eventId, databaseContext);
					}
					await wikiPageService.createWiki(testingContext.currentUserSecurityContext, 'event wiki', testingContext.world.rootFolder, databaseContext);
					eventId = (await databaseContext.wikiPageRepository.findOneByNameAndWorld('event wiki', testingContext.world._id))._id;
					await wikiPageService.updateWiki(testingContext.currentUserSecurityContext, eventId, databaseContext, undefined, undefined, undefined, EVENT_WIKI);

					await session.commit();
				});

				test('update event', async () => {
					const result = await testingContext.server.executeGraphQLQuery({
						query: UPDATE_EVENT,
						variables: {
							wikiId: eventId,
							calendarId: testingContext.calendar._id,
							age: 1,
							year: 1,
							month: 1,
							day: 1,
							hour: 1,
							minute: 1,
							second: 1
						},
					});
					expect(result).toMatchSnapshot({
						data: {
							updateEventWiki: {
								_id: expect.any(String),
								calendar: {
									_id: expect.any(String),
								},
								age: 1,
								year: 1,
								month: 1,
								day: 1,
								hour: 1,
								minute: 1,
								second: 1
							}
						},
						errors: undefined
					});
				});
			});
		});
	});
});
