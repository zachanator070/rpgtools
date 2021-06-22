import { GraphqlDataloader } from "../graphql-dataloader";
import { Pin } from "../../domain-entities/pin";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { PinRepository } from "../../types";
import { PinAuthorizationRuleset } from "../../security/pin-authorization-ruleset";

export class PinDataLoader extends GraphqlDataloader<Pin> {
	constructor(@inject(INJECTABLE_TYPES.PinRepository) repo: PinRepository) {
		super(repo, new PinAuthorizationRuleset());
	}
}
