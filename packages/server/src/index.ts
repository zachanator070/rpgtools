import {container} from "./di/inversify";
import {INJECTABLE_TYPES} from "./di/injectable-types";
import RpgToolsServer from "./server/rpgtools-server";

const server = container.get<RpgToolsServer>(INJECTABLE_TYPES.RpgToolsServer);

(async () => {
	await server.start();
})();
