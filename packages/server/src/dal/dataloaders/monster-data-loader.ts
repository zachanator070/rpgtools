import { GraphqlDataloader } from "../graphql-dataloader";
import { Monster } from "../../domain-entities/monster";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { MonsterRepository } from "../../types";
import { MonsterAuthorizationPolicy } from "../../security/policy/monster-authorization-policy";

@injectable()
export class MonsterDataLoader extends GraphqlDataloader<Monster> {

	@inject(INJECTABLE_TYPES.MonsterRepository)
	repo: MonsterRepository;

}
