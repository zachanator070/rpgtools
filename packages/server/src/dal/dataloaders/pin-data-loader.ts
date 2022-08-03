import { GraphqlDataloader } from "../graphql-dataloader";
import { Pin } from "../../domain-entities/pin";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { PinRepository } from "../../types";
import { PinAuthorizationPolicy } from "../../security/policy/pin-authorization-policy";

@injectable()
export class PinDataLoader extends GraphqlDataloader<Pin> {

	@inject(INJECTABLE_TYPES.PinRepository)
	repository: PinRepository;

}
