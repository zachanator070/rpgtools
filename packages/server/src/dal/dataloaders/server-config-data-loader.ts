import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	getRepository(databaseContext: DatabaseContext): Repository<ServerConfig> {
		return databaseContext.serverConfigRepository;
	}

}
