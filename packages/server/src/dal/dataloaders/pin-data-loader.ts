import { GraphqlDataloader } from "../graphql-dataloader";
import { Pin } from "../../domain-entities/pin";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PinRepository } from "../../types";
import { PinAuthorizationRuleset } from "../../security/ruleset/pin-authorization-ruleset";

@injectable()
export class PinDataLoader extends GraphqlDataloader<Pin> {
	@inject(INJECTABLE_TYPES.PinRepository)
	repository: PinRepository;
	@inject(INJECTABLE_TYPES.PinAuthorizationRuleset)
	ruleset: PinAuthorizationRuleset;
}
