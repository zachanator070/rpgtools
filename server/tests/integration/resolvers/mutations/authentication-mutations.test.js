import { createTestClient } from 'apollo-server-testing';
import {ApolloServer} from "apollo-server-express";
import {serverResolvers} from "../../../../src/resolvers/server-resolvers";
import {typeDefs} from '../../../../src/gql-server-schema';
import {User} from "../../../../src/models/user";
import {LOGIN_QUERY, REGISTER_MUTATION} from "../../../../../common/src/gql-queries";
import {ServerConfig} from "../../../../src/models/server-config";
import {ANON_USERNAME} from "../../../../../common/src/permission-constants";

process.env.TEST_SUITE = 'authentication-mutations-test';

describe('authentication-mutations', () => {

	const server = new ApolloServer({
		typeDefs,
		resolvers: serverResolvers,
		context: () => {
			return {currentUser: new User({username: ANON_USERNAME}), res: {cookie: () => {}}};
		}
	});

	const { mutate } = createTestClient(server);


	test('login', async () => {
		const result = await mutate({mutation: LOGIN_QUERY, variables: {username: 'tester', password: 'tester'}});
		expect(result).toMatchSnapshot({
			data: {
				login: {
					_id: expect.any(String)
				}
			}
		});
	});

	test('login bad password', async () => {
		const result = await mutate({mutation: LOGIN_QUERY, variables: {username: 'tester', password: 'asdf'}});
		expect(result).toMatchSnapshot();
	});

	test('login bad username', async () => {
		const result = await mutate({mutation: LOGIN_QUERY, variables: {username: 'tester', password: 'asdf'}});
		expect(result).toMatchSnapshot();
	});

	describe('with good register code available', () => {
		beforeEach(async () => {
			const serverConfig = await ServerConfig.findOne();
			serverConfig.registerCodes.push('asdf');
			await serverConfig.save();
		});

		test('register good', async () => {

			const result = await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'asdf', email: 'asdf@gmail.com', username: 'tester2', password: 'tester'}});
			expect(result).toMatchSnapshot({
				data: {
					register: {
						_id: expect.any(String)
					}
				}
			});
		});

		test('register use code twice', async () => {
			await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'asdf', email: 'asdf@gmail.com', username: 'tester2', password: 'tester'}});
			const result = await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'asdf', email: 'asdf@gmail.com', username: 'tester2', password: 'tester'}});
			expect(result).toMatchSnapshot();
		});

		test('register use email twice', async () => {
			await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'asdf', email: 'asdf@gmail.com', username: 'tester2', password: 'tester'}});
			const result = await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'qwerty', email: 'asdf@gmail.com', username: 'tester3', password: 'tester'}});
			expect(result).toMatchSnapshot();
		});

		test('register use username twice', async () => {
			await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'asdf', email: 'tester2@gmail.com', username: 'tester2', password: 'tester'}});
			const result = await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: 'qwerty', email: 'tester3@gmail.com', username: 'tester2', password: 'tester'}});
			expect(result).toMatchSnapshot();
		});
	});

	test('register bad code', async () => {
		const result = await mutate({mutation: REGISTER_MUTATION, variables: {registerCode: '1234', email: 'asdf@gmail.com', username: 'tester2', password: 'tester'}});
		expect(result).toMatchSnapshot();
	});
});