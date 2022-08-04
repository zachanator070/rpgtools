import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { WikiFolderAuthorizationPolicy } from "../security/policy/wiki-folder-authorization-policy";
import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class WikiFolder implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public pages: string[];
	public children: string[];

	authorizationPolicy: WikiFolderAuthorizationPolicy;
	factory: Factory<WikiFolder>;

	type: string = WIKI_FOLDER;

	constructor(@inject(INJECTABLE_TYPES.WikiFolderAuthorizationPolicy)
					authorizationPolicy: WikiFolderAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.WikiFolderFactory)
					factory: Factory<WikiFolder>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.wikiFolderRepository;
	}
}
