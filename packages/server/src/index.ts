import {container, bindAll} from "./di/inversify.js";
import {INJECTABLE_TYPES} from "./di/injectable-types.js";
import RpgToolsServer from "./server/rpgtools-server.js";

bindAll();
const server = container.get<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer);

(async () => {
	await server.start();
})();
