import fs from "fs";
import { ARTICLE } from "@rpgtools/common/src/type-constants";
import { CREATE_WIKI } from "@rpgtools/frontend/src/hooks/wiki/useCreateWiki";
import { DELETE_WIKI } from "@rpgtools/frontend/src/hooks/wiki/useDeleteWiki";
import { UPDATE_PLACE } from "@rpgtools/frontend/src/hooks/wiki/useUpdatePlace";
import { UPDATE_WIKI } from "@rpgtools/frontend/src/hooks/wiki/useUpdateWiki";
import {defaultTestingContextFactory} from "../../DefaultTestingContextFactory";
import {container} from "../../../../src/inversify";
import {INJECTABLE_TYPES} from "../../../../src/injectable-types";
import {ImageService} from "../../../../src/types";
import {Image} from "../../../../src/domain-entities/image";
import {FileUpload, Upload} from "graphql-upload";

process.env.TEST_SUITE = "wiki-mutations-test";

describe("wiki page mutations", () => {
	const imageService = container.get<ImageService>(INJECTABLE_TYPES.ImageService);
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

		test("create wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: CREATE_WIKI,
				variables: { name: "new wiki", folderId: world.rootFolder.toString() },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: { wikiId: world.wikiPage, name: "new name" },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update cover image no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_WIKI,
				variables: {
					wikiId: world.wikiPage,
					coverImageId: "12345",
				},
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("delete wiki no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: DELETE_WIKI,
				variables: { wikiId: world.wikiPage},
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
		});

		test("update place no permission", async () => {
			const result = await server.executeGraphQLQuery({
				query: UPDATE_PLACE,
				variables: { placeId: world.wikiPage, mapImageId: null },
			});
			expect(result).toMatchSnapshot({
				errors: expect.arrayContaining([expect.any(Object)]),
			});
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
				testUpload.resolve(content);
				const result = await server.executeGraphQLQuery({
					query: UPDATE_WIKI,
					variables: {
						wikiId: world.wikiPage,
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
							folder: {
								_id: expect.any(String)
							},
						},
					},
					errors: undefined
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
					image = await imageService.createImage(world._id, false, testFile.filename, testFile.createReadStream());
				});

				test("update place", async () => {
					const result = await server.executeGraphQLQuery({
						query: UPDATE_PLACE,
						variables: {
							placeId: world.wikiPage,
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
					const result = await server.executeGraphQLQuery({
						query: UPDATE_WIKI,
						variables: {
							wikiId: world.wikiPage,
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
		});
	});
});
