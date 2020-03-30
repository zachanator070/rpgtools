import {User} from "../../src/models/user";
import {SALT_ROUNDS} from "../../src/resolvers/mutations/authentication-mutations";
import {ServerConfig} from "../../src/models/server-config";
import {Role} from "../../src/models/role";
import {ALL_USERS} from "../../../common/src/role-constants";
import {PermissionAssignment} from "../../src/models/permission-assignement";
import {WORLD_CREATE} from "../../../common/src/permission-constants";
import {SERVER_CONFIG} from "../../../common/src/type-constants";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.set('useCreateIndex', true);
process.env.ACCESS_TOKEN_SECRET = 'asdf1234';
process.env.REFRESH_TOKEN_SECRET = 'asdf1234';

// 5 minutes
jest.setTimeout(1000 * 60 * 5);

beforeEach(async function(done) {
	/*
	  Define clearDB function that will loop through all
	  the collections in our mongoose connection and drop them.
	*/
	async function clearDB() {

		const collections = await mongoose.connection.db.listCollections().toArray();
		for(let collection of collections){
			try{
				await mongoose.connection.db.dropCollection(collection.name);
			}
			catch (e) {
				console.log(`error while clearing collections: ${e.message}`);
			}

		}
	}

	/*
	  If the mongoose connection is closed,
	  start it up using the test url and database name
	  provided by the node runtime ENV
	*/
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(
			`mongodb://localhost:27017/${process.env.TEST_SUITE}`,
		{
					useNewUrlParser: true,
					useUnifiedTopology: true,
					autoIndex: false
				}
			);
		await clearDB();
	} else {
		await clearDB();
	}

	return done();
});

beforeEach(async () => {
	await User.ensureIndexes({ loc: '2d' });
	await User.create({username: 'tester', password: bcrypt.hashSync('tester', SALT_ROUNDS)});
	const server = await ServerConfig.create({version: '1.0', unlockCode: 'asdf', registerCodes: []});
	const allUsersRole = await Role.create({name: ALL_USERS});
	const createWorldPermissions = await PermissionAssignment.create({permission: WORLD_CREATE, subject: server._id, subjectType: SERVER_CONFIG});
	allUsersRole.permissions.push(createWorldPermissions._id);
	await allUsersRole.save();
});

afterEach(async function(done) {
	await mongoose.disconnect();
	return done();
});

afterAll(done => {
	return done();
});