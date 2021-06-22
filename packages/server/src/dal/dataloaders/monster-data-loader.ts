import { GraphqlDataloader } from "../graphql-dataloader";
import { Monster } from "../../domain-entities/monster";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { MonsterRepository } from "../../types";
import { MonsterAuthorizationRuleset } from "../../security/monster-authorization-ruleset";

export class MonsterDataLoader extends GraphqlDataloader<Monster> {
	constructor(@inject(INJECTABLE_TYPES.MonsterRepository) repo: MonsterRepository) {
		super(repo, new MonsterAuthorizationRuleset());
	}
}
