import { ModeledPage } from "./modeled-page.js";
import { PERSON } from "@rpgtools/common/src/type-constants.js";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy.js";
import WikiPageModel from "../dal/sql/models/wiki-page-model.js";

@injectable()
export class Person extends ModeledPage {

	@inject(INJECTABLE_TYPES.PersonFactory)
	factory: EntityFactory<Person, WikiPageModel>;

	type: string = PERSON;

	constructor(@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
					authorizationPolicy: WikiPageAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ModelFactory)
					factory: EntityFactory<Person, WikiPageModel>) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.personRepository;
	}
}
