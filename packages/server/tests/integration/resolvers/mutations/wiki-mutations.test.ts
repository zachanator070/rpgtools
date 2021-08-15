import { Readable } from "stream";
import fs from "fs";
import { ARTICLE } from "../../../../../common/src/type-constants";
import { CREATE_WIKI } from "../../../../../frontend/src/hooks/wiki/useCreateWiki";
import { DELETE_WIKI } from "../../../../../frontend/src/hooks/wiki/useDeleteWiki";
import { UPDATE_PLACE } from "../../../../../frontend/src/hooks/wiki/useUpdatePlace";
import { UPDATE_WIKI } from "../../../../../frontend/src/hooks/wiki/useUpdateWiki";
import {CREATE_IMAGE} from "../../../../../common/src/mutations";
import {defaultTestingContextFactory} from "../../DefaultTestingContextFactory";

process.env.TEST_SUITE = "wiki-mutations-test";

describe("wiki page mutations", () => {
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
				otherPage,
			} = await testingContext.reset());
			mockSessionContextFactory.resetCurrentUser();
		});

		test("create wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_WIKI,
				variables: { name: "new wiki", folderId: world.rootFolder.toString() },
			});
			expect(result).toMatchSnapshot();
		});

		test("update wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: { wikiId: world.wikiPage, name: "new name" },
			});
			expect(result).toMatchSnapshot();
		});

		test("update cover image no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: {
					wikiId: world.wikiPage,
					coverImageId: "12345",
				},
			});
			expect(result).toMatchSnapshot();
		});

		test("delete wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: DELETE_WIKI,
				variables: { wikiId: world.wikiPage},
			});
			expect(result).toMatchSnapshot();
		});

		test("update place no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_PLACE,
				variables: { placeId: world.wikiPage, mapImageId: null },
			});
			expect(result).toMatchSnapshot();
		});

		describe("with authenticated user", () => {
			beforeEach(async () => {
				mockSessionContextFactory.setCurrentUser(currentUser);
			});

			test("create wiki", async () => {
				const result = await server.executeGraphQLQuery({
					query: CREATE_WIKI,
					variables: {
						name: "new wiki",
						folderId: world.rootFolder.toString(),
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						createWiki: {
							_id: expect.any(String),
							folders: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									pages: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
								}),
							]),
						},
					},
				});
			});

			test("update wiki just name", async () => {
				const result = await server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: world.wikiPage,
						name: "new name",
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
						},
					},
				});
			});

			test("update wiki just content", async () => {
				const content = {
					createReadStream: () => Readable.from("wiki content".repeat(1024)),
				};
				const result = await server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: world.wikiPage,
						content: content,
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
							content: expect.any(String),
						},
					},
				});
			});

			test("update cover image", async () => {
				let testFile = {
					filename: "server/tests/integration/resolvers/mutations/testmap.png",
					createReadStream: () =>
						fs.createReadStream("server/tests/integration/resolvers/mutations/testmap.png"),
				};
				const imageResult = await server.executeGraphQLQuery({
					query: CREATE_IMAGE,
					variables: {
						file: testFile,
						worldId: world._id.toString(),
						chunkify: true,
					},
				});
				const result = await server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: world.wikiPage,
						coverImageId: imageResult.data.createImage._id,
					},
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
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
				});
			});

			test("update type", async () => {
				const result = await server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: { wikiId: world.wikiPage, type: ARTICLE },
				});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							},
						},
					},
				});
			});

			test("delete wiki root wiki", async () => {
				const result = await server.executeGraphQLQuery({
					query: DELETE_WIKI,
					variables: { wikiId: world.wikiPage },
				});
				expect(result).toMatchSnapshot();
			});

			test("delete wiki", async () => {
				const result = await server.executeGraphQLQuery({
					query: DELETE_WIKI,
					variables: { wikiId: otherPage._id },
				});
				expect(result).toMatchSnapshot({
					data: {
						deleteWiki: {
							_id: expect.any(String),
							folders: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									children: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
									pages: [],
								}),
								expect.objectContaining({
									_id: expect.any(String),
									children: [],
									pages: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										}),
									]),
								}),
							]),
						},
					},
				});
			});

			test("update place", async () => {
				let testFile = {
					filename: "server/tests/integration/resolvers/mutations/testmap.png",
					createReadStream: () =>
						fs.createReadStream("server/tests/integration/resolvers/mutations/testmap.png"),
				};
				const imageResult = await server.executeGraphQLQuery({
					query: CREATE_IMAGE,
					variables: {
						file: testFile,
						worldId: world._id.toString(),
						chunkify: true,
					},
				});
				const result = await server.executeGraphQLQuery({
					query: UPDATE_PLACE,
					variables: {
						placeId: world.wikiPage,
						mapImageId: imageResult.data.createImage._id,
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
				});
			});
		});
	});
});
