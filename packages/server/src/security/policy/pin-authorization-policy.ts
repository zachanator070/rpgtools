import {
	EntityAuthorizationPolicy,
	PlaceRepository,
	WikiPageRepository,
	WorldRepository,
} from "../../types";
import { Pin } from "../../domain-entities/pin";
import { SecurityContext } from "../security-context";
import { WikiPageAuthorizationPolicy } from "./wiki-page-authorization-policy";
import { PlaceAuthorizationPolicy } from "./place-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { Place } from "../../domain-entities/place";

@injectable()
export class PinAuthorizationPolicy implements EntityAuthorizationPolicy<Pin> {
	@inject(INJECTABLE_TYPES.WikiPageRepository)
	wikiPageRepository: WikiPageRepository;
	@inject(INJECTABLE_TYPES.PlaceRepository)
	placeRepository: PlaceRepository;
	@inject(INJECTABLE_TYPES.WorldRepository)
	worldRepository: WorldRepository;

	entity: Pin;

	canAdmin(context: SecurityContext): Promise<boolean> {
		// pins are not permission controlled yet
		return Promise.resolve(false);
	}

	canCreate = async (context: SecurityContext): Promise<boolean> => {
		const map = await this.placeRepository.findById(this.entity.map);
		if (!map) {
			return false;
		}
		return map.authorizationPolicy.canWrite(context);
	};

	canRead = async (context: SecurityContext): Promise<boolean> => {
		const map = await this.placeRepository.findById(this.entity.map);
		const page = await this.wikiPageRepository.findById(this.entity.page);
		return (
			(await map.authorizationPolicy.canRead(context)) &&
			(page ? await page.authorizationPolicy.canRead(context) : true)
		);
	};

	canWrite = async (context: SecurityContext): Promise<boolean> => {
		const map = await this.placeRepository.findById(this.entity.map);
		return await map.authorizationPolicy.canWrite(context);
	};
}
