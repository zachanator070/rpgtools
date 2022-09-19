import { WikiPage } from "./wiki-page";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, Factory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";

@injectable()
export class Place extends WikiPage {
	public mapImage: string | null;
	public pixelsPerFoot: number | null;

	@inject(INJECTABLE_TYPES.PlaceFactory)
	factory: Factory<Place>;

	type: string = PLACE;

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.placeRepository;
	}
}
