import {User} from "../../../../src/models/user";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../../src/gql-server-schema";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {createTestClient} from "apollo-server-testing";
import {createWorld} from "../../../../src/resolvers/mutations/world-mutations";
import {Readable} from 'stream';
import fs from "fs";
import {ARTICLE, PERSON} from "@rpgtools/common/src/type-constants";
import {WikiPage} from "../../../../src/models/wiki-page";
import {Article} from "../../../../src/models/article";
import {ANON_USERNAME} from "@rpgtools/common/src/permission-constants";
import {CREATE_IMAGE} from "../../../../../app/src/hooks/wiki/useCreateImage";
import {CREATE_WIKI} from "../../../../../app/src/hooks/wiki/useCreateWiki";
import {DELETE_WIKI} from "../../../../../app/src/hooks/wiki/useDeleteWiki";
import {UPDATE_PLACE} from "../../../../../app/src/hooks/wiki/useUpdatePlace";
import {UPDATE_WIKI} from "../../../../../app/src/hooks/wiki/useUpdateWiki";

process.env.TEST_SUITE = 'wiki-mutations-test';

describe('user mutations', () => {
	let currentUser = new User({username: ANON_USERNAME});

	const server = new ApolloServer({
		typeDefs,
		resolvers: serverResolvers,
		context: () => {
			return {
				currentUser: currentUser,
				res: {
					cookie: () => {
					}
				}
			};
		}
	});

	const {mutate} = createTestClient(server);

	describe('with world', () => {

		let world = null;

		beforeEach(async () => {
			const user = await User.findOne({username: 'tester'});
			await user.recalculateAllPermissions();
			world = await createWorld('Earth', false, user);
		});

		test('create wiki no permission', async () => {
			const result = await mutate({mutation: CREATE_WIKI, variables: {name: 'new wiki', folderId: world.rootFolder.toString()}});
			expect(result).toMatchSnapshot();
		});

		test('update wiki no permission', async () => {
			const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), name: 'new name'}});
			expect(result).toMatchSnapshot();
		});

		test('update cover image no permission', async () => {
			const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), coverImageId: '12345'}});
			expect(result).toMatchSnapshot();
		});

		test('delete wiki no permission', async () => {
			const result = await mutate({mutation: DELETE_WIKI, variables: {wikiId: world.wikiPage._id.toString()}});
			expect(result).toMatchSnapshot();
		});

		test('update place no permission', async () => {
			const result = await mutate({mutation: UPDATE_PLACE, variables: {placeId: world.wikiPage._id.toString(), mapImageId: null}});
			expect(result).toMatchSnapshot();
		});

		describe('with authenticated user', () => {
			beforeEach(async () => {
				currentUser = await User.findOne({username: 'tester'}).populate({path: 'roles', populate: {path: 'permissions'}});
				await currentUser.recalculateAllPermissions();
			});

			test('create wiki', async () => {
				const result = await mutate({mutation: CREATE_WIKI, variables: {name: 'new wiki', folderId: world.rootFolder.toString()}});
				expect(result).toMatchSnapshot({
					data: {
						createWiki: {
							_id: expect.any(String),
							folders: expect.arrayContaining([expect.objectContaining({
								_id: expect.any(String),
								pages: expect.arrayContaining([expect.objectContaining({
									_id: expect.any(String)
								})])
							})])
						}
					}
				});
			});

			test('update wiki just name', async () => {
				const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), name: 'new name'}});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id : expect.any(String)
							}
						}
					}
				});
			});

			test('update wiki just content', async () => {
				const content = {
					createReadStream: () => Readable.from('wiki content'.repeat(1024))
				};
				const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), content: content}});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id : expect.any(String)
							},
							content: expect.any(String)
						}
					}
				});
			});

			test('update cover image', async () => {
				let testFile = {
					filename: 'server/tests/integration/resolvers/mutations/testmap.png',
					createReadStream: () => fs.createReadStream('server/tests/integration/resolvers/mutations/testmap.png')
				};
				const imageResult = await mutate({mutation: CREATE_IMAGE, variables: {file: testFile, worldId: world._id.toString(), chunkify: true}});
				const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), coverImageId: imageResult.data.createImage._id}});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String)
							},
							coverImage: {
								_id: expect.any(String),
								chunks: expect.arrayContaining([expect.objectContaining({
									_id: expect.any(String),
									fileId: expect.any(String)
								})]),
								icon: {
									_id: expect.any(String),
									chunks: expect.arrayContaining([expect.objectContaining({
										_id: expect.any(String),
										fileId: expect.any(String)
									})]),
								}
							}
						}
					}
				});
			});

			test('update type', async () => {
				const result = await mutate({mutation: UPDATE_WIKI, variables: {wikiId: world.wikiPage._id.toString(), type: ARTICLE}});
				expect(result).toMatchSnapshot({
					data: {
						updateWiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String)
							}
						}
					}
				});
			});

			test('delete wiki root wiki', async () => {
				const result = await mutate({mutation: DELETE_WIKI, variables: {wikiId: world.wikiPage._id.toString()}});
				expect(result).toMatchSnapshot();
			});

			test('delete wiki', async () => {
				const wiki = await Article.create({name: 'some wiki', world: world._id});
				const result = await mutate({mutation: DELETE_WIKI, variables: {wikiId: wiki._id.toString()}});
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
										})
									]),
									pages: [],
								}),
								expect.objectContaining({
									_id: expect.any(String),
									children: [],
									pages: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
										})
									]),
								})
							])
						}
					}
				});
			});

			test('update place', async () => {
				let testFile = {
					filename: 'server/tests/integration/resolvers/mutations/testmap.png',
					createReadStream: () => fs.createReadStream('server/tests/integration/resolvers/mutations/testmap.png')
				};
				const imageResult = await mutate({mutation: CREATE_IMAGE, variables: {file: testFile, worldId: world._id.toString(), chunkify: true}});
				const result = await mutate({mutation: UPDATE_PLACE, variables: {placeId: world.wikiPage._id.toString(), mapImageId: imageResult.data.createImage._id}});
				expect(result).toMatchSnapshot({
					data: {
						updatePlace: {
							_id: expect.any(String),
							mapImage: {
								_id: expect.any(String),
								chunks: expect.arrayContaining([expect.objectContaining({
									_id: expect.any(String),
									fileId: expect.any(String)
								})]),
								icon: {
									_id: expect.any(String),
									chunks: expect.arrayContaining([expect.objectContaining({
										_id: expect.any(String),
										fileId: expect.any(String)
									})]),
								}
							}
						}
					}
				});
			});
		});
	});

});