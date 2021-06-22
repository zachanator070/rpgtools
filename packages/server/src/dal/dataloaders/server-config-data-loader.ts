import { GraphqlDataloader } from "../graphql-dataloader";
import { ServerConfig } from "../../domain-entities/server-config";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ServerConfigRepository } from "../../types";
import { ServerConfigAuthorizationRuleset } from "../../security/server-config-authorization-ruleset";

export class ServerConfigDataLoader extends GraphqlDataloader<ServerConfig> {
	constructor(@inject(INJECTABLE_TYPES.ServerConfigRepository) repo: ServerConfigRepository) {
		super(repo, new ServerConfigAuthorizationRuleset());
	}
}
