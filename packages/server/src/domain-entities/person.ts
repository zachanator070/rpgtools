import { ModeledPage } from "./modeled-page";
import { PERSON } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import {PersonDocument} from "../dal/mongodb/models/person";
import PersonModel from "../dal/sql/models/person-model";

@injectable()
export class Person extends ModeledPage {

	@inject(INJECTABLE_TYPES.PersonFactory)
	factory: EntityFactory<Person, PersonDocument, PersonModel>;

	type: string = PERSON;

	constructor(@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
					authorizationPolicy: WikiPageAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ModelFactory)
					factory: EntityFactory<Person, PersonDocument, PersonModel>) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.personRepository;
	}
}
