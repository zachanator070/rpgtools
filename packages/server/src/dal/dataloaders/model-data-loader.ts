import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ModelRepository } from "../../types";
import { ModelAuthorizationPolicy } from "../../security/policy/model-authorization-policy";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {

	@inject(INJECTABLE_TYPES.ModelRepository)
	repository: ModelRepository;

}
