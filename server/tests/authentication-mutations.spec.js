import { createTestClient } from 'apollo-server-testing';
import {ApolloServer} from "apollo-server-express";
import {serverResolvers} from "../src/resolvers/server-resolvers";
import {typeDefs} from '../src/gql-server-schema';
import {ANON_USERNAME} from "../src/authentication-helpers";
import {User} from "../src/models/user";
import gql from 'graphql-tag';
import {SALT_ROUNDS} from "../src/resolvers/mutations/authentication-mutations";
import {ServerConfig} from "../src/models/server-config";
import bcrypt from "bcrypt";

process.env.TEST_SUITE = 'authentication-mutations-test';

beforeEach(async () => {
	await User.ensureIndexes({ loc: '2d' });
	await User.create({username: 'tester', password: bcrypt.hashSync('tester', SALT_ROUNDS)});
	await ServerConfig.create({version: '1.0'});
});

describe('authentication-mutations', () => {

	const server = new ApolloServer({
		typeDefs,
		resolvers: serverResolvers,
		context: () => {
			return {currentUser: new User({username: ANON_USERNAME}), res: {cookie: () => {}}};
		}
	});

	const { query, mutate } = createTestClient(server);

	const LOGIN_QUERY = gql`
			mutation login($username: String!, $password: String!){
		        login(username: $username, password: $password){
		            _id
		        }
		    }
		`;

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

	test('login unsuccessful', async () => {
		const result = await mutate({mutation: LOGIN_QUERY, variables: {username: 'tester', password: 'asdf'}});
		expect(result).toMatchSnapshot({
			data: {
				login: {
					_id: expect.any(String)
				}
			}
		});
	});
});