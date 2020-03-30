import {ServerConfig} from "../../../../src/models/server-config";
import {User} from "../../../../src/models/user";
import {ANON_USERNAME} from "../../../../src/authentication-helpers";
import {ApolloServer} from "apollo-server-express";
import {typeDefs} from "../../../../src/gql-server-schema";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {createTestClient} from "apollo-server-testing";
import {GENERATE_REGISTER_CODES, UNLOCK_SERVER} from "../../../../../common/src/gql-queries";

process.env.TEST_SUITE = 'server-mutations-test';

describe('server mutations', () => {
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

	describe('with locked server', () => {
		afterEach(async () => {
			const server = await ServerConfig.findOne();
			server.adminUsers = [];
			await server.save();
		});

		test('unlock', async () => {
			const result = await mutate({mutation: UNLOCK_SERVER, variables: {unlockCode: 'asdf', email: 'zach@thezachcave.com', username: 'otherTester', password: 'zach'}});
			expect(result).toMatchSnapshot();
		});

		test('unlock twice', async () => {
			await mutate({mutation: UNLOCK_SERVER, variables: {unlockCode: 'asdf', email: 'zach@thezachcave.com', username: 'otherTester', password: 'zach'}});
			const result = await mutate({mutation: UNLOCK_SERVER, variables: {unlockCode: 'asdf', email: 'zach@thezachcave.com', username: 'otherTester', password: 'zach'}});
			expect(result).toMatchSnapshot();
		});
	});

	describe('with unlocked server', () => {
		beforeEach(async () => {
			const user = await User.findOne({username: 'tester'});
			const server = await ServerConfig.findOne();
			server.adminUsers.push(user);
			await server.save();
		});

		test('generate register codes no permission', async () => {
			const result = await mutate({mutation: GENERATE_REGISTER_CODES, variables:{amount: 10}});
			expect(result).toMatchSnapshot();
		});

		describe('with authenticated user', () => {

			beforeEach(async () => {
				currentUser = await User.findOne({username: 'tester'});
			});

			test('generate register codes', async () => {
				const result = await mutate({mutation: GENERATE_REGISTER_CODES, variables:{amount: 10}});
				expect(result).toMatchSnapshot({
					data: {
						generateRegisterCodes: {
							_id: expect.any(String),
							registerCodes: expect.arrayContaining([expect.any(String)])
						}
					}
				});
			});
		});
	});


});