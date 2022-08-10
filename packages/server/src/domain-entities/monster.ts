import { ModeledPage } from "./modeled-page";
import { MONSTER } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, Repository, RepositoryAccessor, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Monster extends ModeledPage {

	@inject(INJECTABLE_TYPES.MonsterFactory)
	factory: Factory<Monster>;

	type: string = MONSTER;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.monsterRepository;
	}
}
