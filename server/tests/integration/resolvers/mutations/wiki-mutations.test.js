import {User} from "../../../../src/models/user";
import {ANON_USERNAME} from "../../../../src/authentication-helpers";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../../src/gql-server-schema";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {createTestClient} from "apollo-server-testing";
import {CREATE_WIKI, UPDATE_WIKI} from "../../../../../common/src/gql-queries";
import {createWorld} from "../../../../src/resolvers/mutations/world-mutations";
import {Readable} from 'stream';

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
		});
	});

});