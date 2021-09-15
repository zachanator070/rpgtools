import { Seeder, ServerConfigFactory } from "../types";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { MongodbServerConfigRepository } from "../dal/mongodb/repositories/mongodb-server-config-repository";
import { ServerConfig } from "../domain-entities/server-config";

@injectable()
export class ServerConfigSeeder implements Seeder {
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	serverConfigRepository: MongodbServerConfigRepository;
	@inject(INJECTABLE_TYPES.ServerConfigFactory)
	serverConfigFactory: ServerConfigFactory;

	seed = async (): Promise<void> => {
		let server = await this.serverConfigRepository.findOne([]);
		if (!server) {
			server = this.serverConfigFactory(null, "1.0", [], [], uuidv4());
			await this.serverConfigRepository.create(server);
		}
	};
}