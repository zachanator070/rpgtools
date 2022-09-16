import { container } from "../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import {DbEngine, SessionContextFactory, UnitOfWork} from "../../src/types";
import {ServerConfigService} from "../../src/services/server-config-service";
import {Factory} from "../../src/types";
import {MockSessionContextFactory} from "./mock-session-context-factory";
import {DefaultTestingContext} from "./default-testing-context";
import {TEST_INJECTABLE_TYPES} from "./injectable-types";
import RpgToolsServer from "../../src/server/rpgtools-server";

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
	const unitOfWorkFactory = container.get<Factory<UnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory);
	const unitOfWork = unitOfWorkFactory({});
	const serverConfig = await service.getServerConfig(unitOfWork);
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester", unitOfWork);
	await unitOfWork.commit();
});

afterAll(async function () {
	await dbEngine.clearDb();
	await dbEngine.disconnect();
});
