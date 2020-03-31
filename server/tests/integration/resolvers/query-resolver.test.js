import {User} from "../../../src/models/user";
import {ANON_USERNAME} from "../../../src/authentication-helpers";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../src/gql-server-schema";
import {serverResolvers} from "../../../src/resolvers/server-resolvers";
import {createTestClient} from "apollo-server-testing";
import {
	GET_CURRENT_USER,
	GET_CURRENT_WIKI,
	GET_CURRENT_WORLD,
	GET_WORLDS,
	SEARCH_USERS
} from "../../../../common/src/gql-queries";
import {createWorld} from "../../../src/resolvers/mutations/world-mutations";

process.env.TEST_SUITE = 'query-resolver-test';

describe('query resolver', () => {
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

	const {query} = createTestClient(server);

	test('no current user', async () => {
		const result = await query({query: GET_CURRENT_USER});
		expect(result).toMatchSnapshot({
			data: {
				currentUser: {
					_id: expect.any(String)
				}
			}
		});
	});

	test('users', async () => {
		await User.create({username: 'tester2'});
		const result = await query({query: SEARCH_USERS, variables:{username: 'tester2'}});
		expect(result).toMatchSnapshot({
			data: {
				users: {
					docs: expect.arrayContaining([
						expect.objectContaining({
							_id: expect.any(String)
						})
					])
				}
			}
		});
	});

	describe('with authenticated user', () => {

		beforeEach(async () => {
			currentUser = await User.findOne({username: 'tester'});
		});

		test('current user', async () => {
			const result = await query({query: GET_CURRENT_USER});
			expect(result).toMatchSnapshot({
				data: {
					currentUser: {
						_id: expect.any(String)
					}
				}
			});
		});

		describe('with existing world', () => {

			let world = null;

			beforeEach(async () => {
				world = await createWorld('Earth', false, currentUser);
			});

			test('world', async () => {
				const result = await query({query: GET_CURRENT_WORLD, variables: {worldId: world._id.toString()}});
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
										})
									]),
									permissions: expect.arrayContaining([
										expect.objectContaining({
											_id: expect.any(String),
											subject: expect.objectContaining({
												_id: expect.any(String),
											})
										})
									]),
								})
							]),
							wikiPage: {
								_id: expect.any(String),
							},
							rootFolder: {
								_id: expect.any(String),
								children: expect.arrayContaining([
									expect.objectContaining({
										_id: expect.any(String),
									})
								])
							},
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

			test('worlds with one private and one public world', async () => {
				const otherWorld = await createWorld('Azeroth', true, currentUser);
				const result = await query({query: GET_WORLDS, variables: {page: 1}});
				await currentUser.recalculateAllPermissions();
				expect(result).toMatchSnapshot({
					data: {
						worlds: {
							docs: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									wikiPage: expect.objectContaining({
										_id: expect.any(String),
									})
								})
							])
						}
					}
				});
			});

			test('wiki', async () => {
				const result = await query({query: GET_CURRENT_WIKI, variables: {wikiId: world.wikiPage._id.toString()}});
				expect(result).toMatchSnapshot({
					data: {
						wiki: {
							_id: expect.any(String),
							world: {
								_id: expect.any(String),
							}
						}
					}
				});
			});
		});
	});

	describe('with existing world', () => {

		let world = null;

		beforeEach(async () => {
			const user = await User.findOne({username: 'tester'});
			world = await createWorld('Earth', false, user);
		});

		test('world', async () => {
			const result = await query({query: GET_CURRENT_WORLD, variables: {worldId: world._id.toString()}});
			expect(result).toMatchSnapshot();
		});

		test('worlds with one private and one public world', async () => {
			const user = await User.findOne({username: 'tester'}).populate({path: 'roles', populate: {path: 'permissions'}});
			const otherWorld = await createWorld('Azeroth', true, user);
			await currentUser.recalculateAllPermissions();
			const result = await query({query: GET_WORLDS, variables: {page: 1}});
			expect(result).toMatchSnapshot({
				data: {
					worlds: {
						docs: expect.arrayContaining([
							expect.objectContaining({
								_id: expect.any(String),
								wikiPage: expect.objectContaining({
									_id: expect.any(String),
								})
							})
						])
					}
				}
			});
		});

		test('wiki no permission', async () => {
			const result = await query({query: GET_CURRENT_WIKI, variables: {wikiId: world.wikiPage._id.toString()}});
			expect(result).toMatchSnapshot({
				errors: [{
					message: expect.any(String)
				}]
			});
		});
	});
});