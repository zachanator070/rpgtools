import { ModeledPage } from "./modeled-page";
import { PERSON } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, Repository, RepositoryAccessor, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Person extends ModeledPage {

	@inject(INJECTABLE_TYPES.PersonFactory)
	factory: Factory<Person>

	type: string = PERSON;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.personRepository;
	}
}
