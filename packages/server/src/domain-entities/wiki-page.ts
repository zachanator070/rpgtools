import {
	AclEntry,
	DomainEntity, EntityFactory,
	PermissionControlledEntity,
	RepositoryAccessor, WikiPageDocument
} from "../types";
import { WikiPageAuthorizationPolicy } from "../security/policy/wiki-page-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";

@injectable()
export abstract class WikiPage implements PermissionControlledEntity {

	public _id: string;
	public name: string;
	public world: string;
	public coverImage: string | null;
	public contentId: string | null;
	public content: string | null;
	public acl: AclEntry[];
	public relatedWikis: string[];

	authorizationPolicy: WikiPageAuthorizationPolicy;

	constructor(@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
					authorizationPolicy: WikiPageAuthorizationPolicy) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
	}

	abstract type: string;
	abstract factory: EntityFactory<WikiPage, WikiPageDocument, any>;

	abstract getRepository(accessor: RepositoryAccessor): Repository<DomainEntity>;
}
