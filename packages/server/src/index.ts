import {container, bindAll} from "./di/inversify";
import {INJECTABLE_TYPES} from "./di/injectable-types";
import RpgToolsServer from "./server/rpgtools-server";

bindAll();
const server = container.get<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer);

(async () => {
	await server.start();
})();
