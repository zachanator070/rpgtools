import { ModeledPage } from "./modeled-page";
import { ITEM } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, Repository, RepositoryAccessor, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Item extends ModeledPage {

	@inject(INJECTABLE_TYPES.ItemFactory)
	factory: Factory<Item>

	type: string = ITEM;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.itemRepository;
	}
}
