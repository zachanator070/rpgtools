import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { GameRepository } from "../../types";
import { GameAuthorizationRuleset } from "../../security/ruleset/game-authorization-ruleset";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {
	@inject(INJECTABLE_TYPES.GameRepository)
	repository: GameRepository;
	@inject(INJECTABLE_TYPES.GameAuthorizationRuleset)
	ruleset: GameAuthorizationRuleset;
}
