import { container } from "../../src/di/inversify";
import { INJECTABLE_TYPES } from "../../src/di/injectable-types";
import {ApiServer, SessionContextFactory, UnitOfWork} from "../../src/types";
import {ServerConfigService} from "../../src/services/server-config-service";
import {Factory} from "../../src/types";
import {MockSessionContextFactory} from "./mock-session-context-factory";
import {DefaultTestingContext} from "./default-testing-context";
import {TEST_INJECTABLE_TYPES} from "./injectable-types";

const mongoose = require("mongoose");

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

const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);

beforeAll(async () => {
	server.setDbHost("localhost:27017");
	server.setDbName(process.env.TEST_SUITE);
	await server.initDb();
	const service = container.get<ServerConfigService>(INJECTABLE_TYPES.ServerConfigService);
	const unitOfWorkFactory = container.get<Factory<UnitOfWork>>(INJECTABLE_TYPES.DbUnitOfWorkFactory);
	const unitOfWork = unitOfWorkFactory({});
	const serverConfig = await service.getServerConfig(unitOfWork);
	await server.checkConfig();
	await service.unlockServer(serverConfig.unlockCode, "tester@gmail.com", "tester", "tester", unitOfWork);
	await unitOfWork.commit();
});

afterAll(async function () {
	await server.clearDb();
	await mongoose.disconnect();
});
