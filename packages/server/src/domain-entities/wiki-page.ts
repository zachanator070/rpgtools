import {DomainEntity, Factory, Repository, RepositoryAccessor, UnitOfWork} from "../types";
import { WikiPageAuthorizationPolicy } from "../security/policy/wiki-page-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export abstract class WikiPage implements DomainEntity {

	public _id: string;
	public name: string;
	public world: string;
	public coverImage: string | null;
	public contentId: string | null;
	public content: string | null;

	authorizationPolicy: WikiPageAuthorizationPolicy;

	constructor(@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
					authorizationPolicy: WikiPageAuthorizationPolicy) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}

	abstract type: string;
	abstract factory: Factory<WikiPage>;

	abstract getRepository(accessor: RepositoryAccessor): Repository<DomainEntity>;
}
