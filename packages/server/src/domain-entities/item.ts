import { ModeledPage } from "./modeled-page.js";
import { ITEM } from "@rpgtools/common/src/type-constants.js";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory,  RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy.js";
import WikiPageModel from "../dal/sql/models/wiki-page-model.js";

@injectable()
export class Item extends ModeledPage {

	factory: EntityFactory<Item, WikiPageModel>;

	type: string = ITEM;

	constructor(
		@inject(INJECTABLE_TYPES.ItemFactory)
			factory: EntityFactory<Item, WikiPageModel>,
		@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
			authorizationPolicy: WikiPageAuthorizationPolicy
	) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.itemRepository;
	}
}
