import { WikiPage } from "./wiki-page";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, PlaceFactory, Repository, UnitOfWork} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";

@injectable()
export class Place extends WikiPage {
	public mapImage: string | null;
	public pixelsPerFoot: number | null;

	@inject(INJECTABLE_TYPES.PlaceFactory)
	factory: Factory<Place>;

	type: string = PLACE;

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.placeRepository;
	}
}
