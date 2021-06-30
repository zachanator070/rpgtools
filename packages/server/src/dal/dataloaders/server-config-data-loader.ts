import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ServerConfigRepository } from "../../types";
import { ServerConfigAuthorizationRuleset } from "../../security/server-config-authorization-ruleset";

@injectable()
export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	@inject(INJECTABLE_TYPES.ServerConfigRepository)
	repository: ServerConfigRepository;
	@inject(INJECTABLE_TYPES.ServerConfigAuthorizationRuleset)
	ruleset: ServerConfigAuthorizationRuleset;
}
