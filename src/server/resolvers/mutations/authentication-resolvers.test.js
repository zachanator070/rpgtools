import {authenticationResolvers} from './authentication-resolvers';
import bcrypt from 'bcrypt';
import {SALT_ROUNDS} from './authentication-resolvers';

test('login', async () => {

	const testUser = {password: '', populate: async (path) => {return testUser;}};

	const cases = [
		{
			testPassword: 'asdf',
			testPasswordHash: bcrypt.hashSync('asdf', SALT_ROUNDS),
			foundUser: testUser,
			success: true
		},
		{
			testPassword: '1234',
			testPasswordHash: bcrypt.hashSync('asdf', SALT_ROUNDS),
			foundUser: testUser,
			success: false
		},
		{
			testPassword: '1234',
			testPasswordHash: bcrypt.hashSync('asdf', SALT_ROUNDS),
			foundUser: null,
			success: false
		},
		{
			testPassword: 'asdf',
			testPasswordHash: bcrypt.hashSync('asdf', SALT_ROUNDS),
			foundUser: null,
			success: false
		},
	];

	for(let testCase of cases ){
		if(testCase.foundUser){
			testCase.foundUser.password = testCase.testPasswordHash;
		}
		const User = {
			findOne: (options) => {
				return testCase.foundUser;
			},
		};

		const res = {cookie: (name, value, options) => {}};

		try{
			expect(await authenticationResolvers.login(
				{},
				{username: 'user', password: testCase.testPassword},
				{res, imports: {User, createTokens: (user) => {return {accessToken: '1234', refreshToken: '567'}}}}
			)).toBe(testCase.foundUser);
		} catch (error){
			if(testCase.success){
				throw error;
			}
		}

	}
});

test('logout', async () => {

	const testUser = {password: '', populate: async (path) => {return testUser;}, save: async () => {}};

	const cases = [
		{
			currentUser: testUser,
			success: true
		},
		{
			currentUser: null,
			success: false
		},
	];

	for(let testCase of cases ){
		if(testCase.foundUser){
			testCase.foundUser.password = testCase.testPasswordHash;
		}

		const res = {clearCookie: (name) => {}};

		try{
			expect(await authenticationResolvers.logout(
				{},
				{username: 'user', password: testCase.testPassword},
				{res, currentUser: testCase.currentUser}
			)).toBe('success');
		} catch (error){
			if(testCase.success){
				throw error;
			}
		}

	}
});

test('register', async () => {

	const testUser = {password: '', populate: async (path) => {return testUser;}};

	const cases = [
		{
			email: 'bob@thezachcave.com',
			username: 'bob',
			password: 'asdf',
			createdUser: testUser,
			usersWithSameEmail: [],
			usersWithSameUsername: [],
			success: true
		},
		{
			email: 'bob@thezachcave.com',
			username: 'bob',
			password: 'asdf',
			createdUser: testUser,
			usersWithSameEmail: [{}],
			usersWithSameUsername: [],
			success: false
		},
		{
			email: 'bob@thezachcave.com',
			username: 'bob',
			password: 'asdf',
			createdUser: testUser,
			usersWithSameEmail: [],
			usersWithSameUsername: [{}],
			success: false
		},
	];

	for(let testCase of cases ){

		const User = {
			find: jest
				.fn()
				.mockImplementationOnce(options => testCase.usersWithSameEmail)
				.mockImplementationOnce(options => testCase.usersWithSameUsername),
			create: (options) => {
				return testCase.createdUser;
			}
		};

		const res = {cookie: (name, value, options) => {}};

		try{
			expect(await authenticationResolvers.register(
				{},
				{email: 'email', username: 'user', password: testCase.password},
				{res, imports: {User}}
			)).toBe(testCase.createdUser);
		} catch (error){
			if(testCase.success){
				throw error;
			}
		}

	}
});