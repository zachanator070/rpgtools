import { ModeledPage } from "./modeled-page";
import { PERSON } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Person extends ModeledPage {

	@inject(INJECTABLE_TYPES.PersonFactory)
	factory: Factory<Person>

	type: string = PERSON;

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.personRepository;
	}
}
