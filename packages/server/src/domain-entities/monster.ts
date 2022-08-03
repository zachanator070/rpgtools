import { ModeledPage } from "./modeled-page";
import { MONSTER } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";
import {DomainEntity, Repository, UnitOfWork} from "../types";

@injectable()
export class Monster extends ModeledPage {
	type: string = MONSTER;

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.monsterRepository;
	}
}
