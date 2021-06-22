import { GraphqlDataloader } from "../graphql-dataloader";
import { Model } from "../../domain-entities/model";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ModelRepository } from "../../types";
import { ModelAuthorizationRuleset } from "../../security/model-authorization-ruleset";

export class ModelDataLoader extends GraphqlDataloader<Model> {
	constructor(@inject(INJECTABLE_TYPES.ModelRepository) repo: ModelRepository) {
		super(repo, new ModelAuthorizationRuleset());
	}
}
