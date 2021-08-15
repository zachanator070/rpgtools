import {container} from "./inversify.config";
import {INJECTABLE_TYPES} from "./injectable-types";
import {ApiServer} from "./types";

const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);

(async () => {
	await server.start();
})();
