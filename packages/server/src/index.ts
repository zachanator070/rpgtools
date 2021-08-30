import {container} from "./inversify";
import {INJECTABLE_TYPES} from "./injectable-types";
import {ApiServer} from "./types";

const server = container.get<ApiServer>(INJECTABLE_TYPES.ApiServer);

(async () => {
	await server.start();
})();
