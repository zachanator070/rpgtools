import { GraphqlDataloader } from "../graphql-dataloader.js";
import { ServerConfig } from "../../domain-entities/server-config.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	getRepository(databaseContext: DatabaseContext): Repository<ServerConfig> {
		return databaseContext.serverConfigRepository;
	}

}
