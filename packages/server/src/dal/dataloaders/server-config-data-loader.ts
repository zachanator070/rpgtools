import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ServerConfigRepository } from "../../types";
import { ServerConfigAuthorizationPolicy } from "../../security/policy/server-config-authorization-policy";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {

	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	repository: ServerConfigRepository;

}
