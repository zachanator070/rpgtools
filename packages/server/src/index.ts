import { ExpressRpgToolsServerFactory } from "./express-rpgtools-server-factory";

const serverFactory: ExpressRpgToolsServerFactory = new ExpressRpgToolsServerFactory();

const server = serverFactory.create();

(async () => {
	await server.start();
})();
