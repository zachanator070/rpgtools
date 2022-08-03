import { ModeledPage } from "./modeled-page";
import { PERSON } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";
import {DomainEntity, Repository, UnitOfWork} from "../types";

@injectable()
export class Person extends ModeledPage {
	type: string = PERSON;

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.personRepository;
	}
}
