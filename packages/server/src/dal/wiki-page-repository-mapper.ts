import { WikiPage } from "../domain-entities/wiki-page";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import {
	ItemRepository,
	MonsterRepository,
	PersonRepository,
	PlaceRepository,
	Repository,
} from "../types";
import { ITEM, MONSTER, PERSON, PLACE } from "../../../common/src/type-constants";

export class WikiPageRepositoryMapper {
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.PersonRepository)
	personRepository: PersonRepository;
	@inject(INJECTABLE_TYPES.ItemRepository)
	itemRepository: ItemRepository;
	@inject(INJECTABLE_TYPES.MonsterRepository)
	monsterRepository: MonsterRepository;

	map = (page: WikiPage): Repository<WikiPage> => {
		switch (page.type) {
			case PLACE:
				return this.placeRepository;
			case PERSON:
				return this.personRepository;
			case ITEM:
				return this.itemRepository;
			case MONSTER:
				return this.monsterRepository;
			default:
				console.warn(`WikiPage type ${page.type} does not map to a concrete wiki type`);
				break;
		}
	};
}
