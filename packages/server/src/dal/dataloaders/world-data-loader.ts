import { GraphqlDataloader } from "../graphql-dataloader";
import { World } from "../../domain-entities/world";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { WorldRepository } from "../../types";
import { WorldAuthorizationRuleset } from "../../security/world-authorization-ruleset";

export class WorldDataLoader extends GraphqlDataloader<World> {
	constructor(@inject(INJECTABLE_TYPES.WorldRepository) repo: WorldRepository) {
		super(repo, new WorldAuthorizationRuleset());
	}
}
