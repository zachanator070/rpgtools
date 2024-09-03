import { Seeder } from "../types";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import ServerConfigFactory from "../domain-entities/factory/server-config-factory";
import {DatabaseContext} from "../dal/database-context";

@injectable()
export class ServerConfigSeeder implements Seeder {

	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	seed = async (databaseContext: DatabaseContext): Promise<void> => {
		let server = await databaseContext.serverConfigRepository.findOne();
		if (!server) {
			const unlockCode: string = process.env.UNLOCK_CODE || uuidv4();
			let registerCodes: string[] = [];
			if (process.env.REGISTER_CODES) {
				registerCodes = process.env.REGISTER_CODES.split(',');
			}
			server = this.serverConfigFactory.build({version: "1.0", registerCodes, adminUsers: [], unlockCode, acl: [], defaultWorld: null});
			await databaseContext.serverConfigRepository.create(server);
		}
	};
}
