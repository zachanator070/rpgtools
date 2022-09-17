import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	getRepository(unitOfWork: UnitOfWork): Repository<ServerConfig> {
		return unitOfWork.serverConfigRepository;
	}

}
