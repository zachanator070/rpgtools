import { ModeledPage } from "./modeled-page";
import { MONSTER } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, Factory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import {MonsterDocument} from "../dal/mongodb/models/monster";
import MonsterModel from "../dal/sql/models/monster-model";

@injectable()
export class Monster extends ModeledPage {

	@inject(INJECTABLE_TYPES.MonsterFactory)
	factory: EntityFactory<Monster, MonsterDocument, MonsterModel>;

	type: string = MONSTER;

	constructor(
		@inject(INJECTABLE_TYPES.MonsterFactory)
			factory: EntityFactory<Monster, MonsterDocument, MonsterModel>,
		@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
			authorizationPolicy: WikiPageAuthorizationPolicy
	) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.monsterRepository;
	}
}
