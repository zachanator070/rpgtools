import { GraphqlDataloader } from "../graphql-dataloader";
import { World } from "../../domain-entities/world";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { WorldRepository } from "../../types";
import { WorldAuthorizationRuleset } from "../../security/ruleset/world-authorization-ruleset";

@injectable()
export class WorldDataLoader extends GraphqlDataloader<World> {
	@inject(INJECTABLE_TYPES.WorldRepository)
	repository: WorldRepository;
	@inject(INJECTABLE_TYPES.WorldAuthorizationRuleset)
	ruleset: WorldAuthorizationRuleset;
}
