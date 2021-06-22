import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { GameRepository } from "../../types";
import { GameAuthorizationRuleset } from "../../security/game-authorization-ruleset";

export class GameDataLoader extends GraphqlDataloader<Game> {
	constructor(@inject(INJECTABLE_TYPES.GameRepository) repo: GameRepository) {
		super(repo, new GameAuthorizationRuleset());
	}
}
