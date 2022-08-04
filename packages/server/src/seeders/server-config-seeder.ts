import { Seeder, ServerConfigFactory } from "../types";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";

@injectable()
export class ServerConfigSeeder implements Seeder {
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: MongodbServerConfigRepository;
	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	seed = async (): Promise<void> => {
		let server = await this.serverConfigRepository.findOne([]);
		if (!server) {
			const unlockCode: string = process.env.UNLOCK_CODE || uuidv4();
			let registerCodes: string[] = [];
			if (process.env.REGISTER_CODES) {
				registerCodes = process.env.REGISTER_CODES.split(',');
			}
			server = this.serverConfigFactory({_id: null, version: "1.0", registerCodes, adminUsers: [], unlockCode});
			await this.serverConfigRepository.create(server);
		}
	};
}
