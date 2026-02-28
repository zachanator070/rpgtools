import * as dotenv from 'dotenv'
dotenv.config({path: './test.env'});

import { container, bindAll } from "../../src/di/inversify.js";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types.js";
import {DbEngine, SessionContextFactory} from "../../src/types.js";
import {ServerConfigService} from "../../src/services/server-config-service.js";
import {MockSessionContextFactory} from "./mock-session-context-factory.js";
import {DefaultTestingContext} from "./default-testing-context.js";
import {TEST_INJECTABLE_TYPES} from "./injectable-types.js";
import RpgToolsServer from "../../src/server/rpgtools-server.js";
import Logger from '../../src/logging/logger.js';

process.env.ACCESS_TOKEN_SECRET = "asdf1234";
process.env.REFRESH_TOKEN_SECRET = "asdf1234";

process.env.NODE_ENV = "test";

bindAll();

container
	.rebind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
	.to(MockSessionContextFactory)
	.inSingletonScope();
container.bind<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext).to(DefaultTestingContext);

const server = container.get<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer);
const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);
const logger = container.get<Logger>(INJECTABLE_TYPES.Logger);
logger.silence();


beforeAll(async () => {
	dbEngine.setDbHost("localhost");
	await dbEngine.changeDb(process.env.TEST_SUITE);
	await dbEngine.connect();
	const databaseContext = await dbEngine.createDatabaseContext();
	await server.seedDB(databaseContext);
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	await service.unlockServer("tester@gmail.com", "tester", "tester", databaseContext);
});

afterAll(async function () {
	await dbEngine.clearDb();
	await dbEngine.disconnect();
});
