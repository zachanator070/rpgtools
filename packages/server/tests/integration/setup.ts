import { container } from "../../src/inversify.config";
import { INJECTABLE_TYPES } from "../../src/injectable-types";
import { ApiServer, ServerConfigService } from "../../src/types";

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

mongoose.set("useCreateIndex", true);

process.env.ACCESS_TOKEN_SECRET = "asdf1234";
process.env.REFRESH_TOKEN_SECRET = "asdf1234";

process.env.NODE_ENV = "test";

// 5 minutes
jest.setTimeout(1000 * 60 * 5);

beforeAll(async () => {
	const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);
	server.setDbHost("localhost:27017");
	server.setDbName(process.env.TEST_SUITE);
	await server.initDb();
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	const serverConfig = await service.getServerConfig();
	await server.checkConfig();
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester");
});

afterAll(async function (done) {
	const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);
	await server.clearDb();
	await mongoose.disconnect();
	return done();
});

afterAll((done) => {
	return done();
});
