import { Seeder } from "../types.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import ServerConfigFactory from "../domain-entities/factory/server-config-factory.js";
import {DatabaseContext} from "../dal/database-context.js";

@injectable()
export class ServerConfigSeeder implements Seeder {

	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	seed = async (databaseContext: DatabaseContext): Promise<void> => {
		let server = await databaseContext.serverConfigRepository.findOne();
		if (!server) {
			server = this.serverConfigFactory.build({version: "1.0", adminUsers: [], acl: [], defaultWorld: null});
			await databaseContext.serverConfigRepository.create(server);
		}
	};
}
