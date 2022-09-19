import { container } from "../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import {DbEngine, SessionContextFactory} from "../../src/types";
import {ServerConfigService} from "../../src/services/server-config-service";
import {Factory} from "../../src/types";
import {MockSessionContextFactory} from "./mock-session-context-factory";
import {DefaultTestingContext} from "./default-testing-context";
import {TEST_INJECTABLE_TYPES} from "./injectable-types";
import RpgToolsServer from "../../src/server/rpgtools-server";
import {DatabaseContext} from "../../src/dal/database-context";

process.env.ACCESS_TOKEN_SECRET = "asdf1234";
process.env.REFRESH_TOKEN_SECRET = "asdf1234";

process.env.NODE_ENV = "test";

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
	dbEngine.setDbHost("localhost:27017");
	dbEngine.setDbName(process.env.TEST_SUITE);
	await dbEngine.connect();
	await server.seedDB();
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	const databaseContextFactory = container.get<Factory<DatabaseContext>>(INJECTABLE_TYPES.DatabaseContextFactory);
	const session = await dbEngine.createDatabaseSession();
	const databaseContext = databaseContextFactory({session});
	const serverConfig = await service.getServerConfig(databaseContext);
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester", databaseContext);
	await session.commit();
});

afterAll(async function () {
	await dbEngine.clearDb();
	await dbEngine.disconnect();
});
