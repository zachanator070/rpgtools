import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	getRepository(unitOfWork: UnitOfWork): Repository<ServerConfig> {
		return unitOfWork.serverConfigRepository;
	}

}
