import { GraphqlDataloader } from "../graphql-dataloader";
import { Place } from "../../domain-entities/place";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { PlaceRepository } from "../../types";
import { PlaceAuthorizationRuleset } from "../../security/place-authorization-ruleset";

export class PlaceDataLoader extends GraphqlDataloader<Place> {
	constructor(@inject(INJECTABLE_TYPES.PlaceRepository) repo: PlaceRepository) {
		super(repo, new PlaceAuthorizationRuleset());
	}
}
