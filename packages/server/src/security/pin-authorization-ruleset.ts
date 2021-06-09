import {
	EntityAuthorizationRuleset,
	PlaceRepository,
	WikiPageRepository,
	WorldRepository,
} from "../types";
import { Pin } from "../domain-entities/pin";
import { SecurityContext } from "../security-context";
import { WikiPageAuthorizationRuleset } from "./wiki-page-authorization-ruleset";
import { PlaceAuthorizationRuleset } from "./place-authorization-ruleset";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";
import { Place } from "../domain-entities/place";

export class PinAuthorizationRuleset implements EntityAuthorizationRuleset<Pin> {
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	wikiPageAuthorizationRuleset = new WikiPageAuthorizationRuleset();
	placeAuthorizationRuleset = new PlaceAuthorizationRuleset();

	canAdmin(context: SecurityContext, entity: Pin): Promise<boolean> {
		// pins are permission controlled yet
		return Promise.resolve(false);
	}

	canCreate = async (context: SecurityContext, entity: Place): Promise<boolean> => {
		return this.wikiPageAuthorizationRuleset.canWrite(context, entity);
	};

	canRead = async (context: SecurityContext, entity: Pin): Promise<boolean> => {
		const map = await this.placeRepository.findById(entity.map);
		const page = await this.wikiPageRepository.findById(entity.page);
		return (
			(await this.placeAuthorizationRuleset.canRead(context, map)) &&
			(page ? await this.wikiPageAuthorizationRuleset.canRead(context, page) : true)
		);
	};

	canWrite = async (context: SecurityContext, entity: Pin): Promise<boolean> => {
		const map = await this.placeRepository.findById(entity.map);
		return await this.placeAuthorizationRuleset.canWrite(context, map);
	};
}
