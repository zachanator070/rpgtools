import { GraphqlDataloader } from "../graphql-dataloader";
import { Game } from "../../domain-entities/game";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { GameRepository } from "../../types";
import { GameAuthorizationPolicy } from "../../security/policy/game-authorization-policy";

@injectable()
export class GameDataLoader extends GraphqlDataloader<Game> {

	@inject(INJECTABLE_TYPES.GameRepository)
	repository: GameRepository;

}
