import { WikiPage } from "./wiki-page";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";
import {PlaceDocument} from "../dal/mongodb/models/place";
import WikiPageModel from "../dal/sql/models/wiki-page-model";

@injectable()
export class Place extends WikiPage {
	public mapImage: string | null;
	public pixelsPerFoot: number | null;

	@inject(INJECTABLE_TYPES.PlaceFactory)
	factory: EntityFactory<Place, PlaceDocument, WikiPageModel>;

	type: string = PLACE;

	constructor(
		@inject(INJECTABLE_TYPES.ArticleFactory)
			factory: EntityFactory<Place, PlaceDocument, WikiPageModel>,
		@inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
			authorizationPolicy: WikiPageAuthorizationPolicy
	) {
		super(authorizationPolicy);
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.placeRepository;
	}
}
