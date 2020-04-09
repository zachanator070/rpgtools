import {User} from "../../../../src/models/user";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../../src/gql-server-schema";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {createTestClient} from "apollo-server-testing";
import {createWorld} from "../../../../src/resolvers/mutations/world-mutations";
import {WikiFolder} from "../../../../src/models/wiki-folder";
import {CREATE_IMAGE} from "../../../../../common/src/gql-queries";
import fs from 'fs';
import {ANON_USERNAME} from "../../../../../common/src/permission-constants";

process.env.TEST_SUITE = 'image-mutations-test';

describe('folder-mutations', () => {

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

	describe('with existing world', () => {

		let world = null;
		let testFile = {
			filename: 'server/tests/integration/resolvers/mutations/testmap.png',
			createReadStream: () => fs.createReadStream('server/tests/integration/resolvers/mutations/testmap.png')
		};

		beforeEach(async () => {
			const user = await User.findOne({username: 'tester'});
			await user.recalculateAllPermissions();
			world = await createWorld('Earth', false, user);
			const rootFolder = await WikiFolder.findById(world.rootFolder);
			await rootFolder.save();
		});

		describe('with unauthenticated user', () => {
			test('create image no permission', async () => {
				const result = await mutate({mutation: CREATE_IMAGE, variables: {file: testFile, worldId: world._id.toString(), chunkify: true}});
				expect(result).toMatchSnapshot({
					data: {
						createImage: {
							_id: expect.any(String)
						}
					}
				});
			});
		});

		describe('with authenticated user', () => {

			beforeEach(async () => {
				currentUser = await User.find({username: 'tester'});
			});

			test('create image no permission', async () => {
				const result = await mutate({mutation: CREATE_IMAGE, variables: {file: testFile, worldId: world._id.toString(), chunkify: true}});
				expect(result).toMatchSnapshot({
					data: {
						createImage: {
							_id: expect.any(String)
						}
					}
				});
			});
		});
	});
});