import { GraphqlDataloader } from "../graphql-dataloader";
import { Place } from "../../domain-entities/place";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PlaceRepository } from "../../types";
import { PlaceAuthorizationRuleset } from "../../security/ruleset/place-authorization-ruleset";

@injectable()
export class PlaceDataLoader extends GraphqlDataloader<Place> {
	@inject(INJECTABLE_TYPES.PlaceRepository)
	repository: PlaceRepository;
	@inject(INJECTABLE_TYPES.PlaceAuthorizationRuleset)
	ruleset: PlaceAuthorizationRuleset;
}
