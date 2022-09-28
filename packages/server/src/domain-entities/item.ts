import { ModeledPage } from "./modeled-page";
import { ITEM } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory,  RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import {ItemDocument} from "../dal/mongodb/models/item";

@injectable()
export class Item extends ModeledPage {

	factory: EntityFactory<Item, ItemDocument>;

	type: string = ITEM;

	constructor(
		@inject(INJECTABLE_TYPES.ItemFactory)
			factory: EntityFactory<Item, ItemDocument>,
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
