import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ModelRepository } from "../../types";
import { ModelAuthorizationRuleset } from "../../security/model-authorization-ruleset";

@injectable()
export class ModelDataLoader extends GraphqlDataloader<Model> {
	@inject(INJECTABLE_TYPES.ModelRepository)
	repository: ModelRepository;
	@inject(INJECTABLE_TYPES.ModelAuthorizationRuleset)
	ruleset: ModelAuthorizationRuleset;
}
