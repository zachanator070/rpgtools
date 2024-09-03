import * as dotenv from 'dotenv'
dotenv.config({path: './jest.env'});

import { container, bindAll } from "../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import {DbEngine, SessionContextFactory} from "../../src/types";
import {ServerConfigService} from "../../src/services/server-config-service";
import {MockSessionContextFactory} from "./mock-session-context-factory";
import {DefaultTestingContext} from "./default-testing-context";
import {TEST_INJECTABLE_TYPES} from "./injectable-types";
import RpgToolsServer from "../../src/server/rpgtools-server";
import {jest} from '@jest/globals'

process.env.ACCESS_TOKEN_SECRET = "asdf1234";
process.env.REFRESH_TOKEN_SECRET = "asdf1234";

process.env.NODE_ENV = "test";

bindAll();

// 5 minutes
jest.setTimeout(1000 * 60 * 5);

container
	.rebind<SessionContextFactory>(INJECTABLE_TYPES.SessionContextFactory)
	.to(MockSessionContextFactory)
	.inSingletonScope();
container.bind<DefaultTestingContext>(TEST_INJECTABLE_TYPES.DefaultTestingContext).to(DefaultTestingContext);

const server = container.get<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer);
const dbEngine = container.get<DbEngine>(INJECTABLE_TYPES.DbEngine);

beforeAll(async () => {
	dbEngine.setDbHost("localhost");
	await dbEngine.changeDb(process.env.TEST_SUITE);
	await dbEngine.connect();
	const databaseContext = await dbEngine.createDatabaseContext();
	await server.seedDB(databaseContext);
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	const serverConfig = await service.getServerConfig(databaseContext);
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester", databaseContext);
});

afterAll(async function () {
	await dbEngine.clearDb();
	await dbEngine.disconnect();
});
