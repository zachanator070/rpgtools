import { container } from "../../src/inversify.config";
import { INJECTABLE_TYPES } from "../../src/injectable-types";
import { ApiServer, ServerConfigService } from "../../src/types";

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

mongoose.set("useCreateIndex", true);

process.env.ACCESS_TOKEN_SECRET = "asdf1234";
process.env.REFRESH_TOKEN_SECRET = "asdf1234";

// 5 minutes
jest.setTimeout(1000 * 60 * 5);

beforeEach(async function (done) {
	/*
	  Define clearDB function that will loop through all
	  the collections in our mongoose connection and drop them.
	*/
	async function clearDB() {
		const collections = await mongoose.connection.db.listCollections().toArray();
		for (let collection of collections) {
			try {
				await mongoose.connection.db.dropCollection(collection.name);
			} catch (e) {
				console.log(`error while clearing collections: ${e.message}`);
			}
		}
	}

	/*
	  If the mongoose connection is closed,
	  start it up using the test url and database name
	  provided by the node runtime ENV
	*/
	// if (mongoose.connection.readyState === 0) {
	// 	await mongoose.connect(`mongodb://localhost:27017/${process.env.TEST_SUITE}`, {
	// 		useNewUrlParser: true,
	// 		useUnifiedTopology: true,
	// 		autoIndex: false,
	// 	});
	// }

	// await clearDB();

	return done();
});

beforeEach(async () => {
	const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);
	server.setDbHost("localhost:27017");
	server.setDbName(process.env.TEST_SUITE);
	await server.initDb();
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	const serverConfig = await service.getServerConfig();
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester");
});

afterEach(async function (done) {
	const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);
	await server.clearDb();
	await mongoose.disconnect();
	return done();
});

afterAll((done) => {
	return done();
});
