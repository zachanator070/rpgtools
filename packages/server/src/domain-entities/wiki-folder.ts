import {
	AclEntry,
	DomainEntity, EntityFactory,
	PermissionControlledEntity,
	RepositoryAccessor
} from "../types";
import { WikiFolderAuthorizationPolicy } from "../security/policy/wiki-folder-authorization-policy.js";
import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import WikiFolderModel from "../dal/sql/models/wiki-folder-model.js";

@injectable()
export class WikiFolder implements PermissionControlledEntity {
	public _id: string;
	public name: string;
	public world: string;
	public pages: string[];
	public children: string[];
	public acl: AclEntry[];

	authorizationPolicy: WikiFolderAuthorizationPolicy;
	factory: EntityFactory<WikiFolder, WikiFolderModel>;

	type: string = WIKI_FOLDER;

	constructor(@inject(INJECTABLE_TYPES.WikiFolderAuthorizationPolicy)
					authorizationPolicy: WikiFolderAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.WikiFolderFactory)
					factory: EntityFactory<WikiFolder, WikiFolderModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.wikiFolderRepository;
	}
}
