import { WikiPage } from "./wiki-page.js";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {inject, injectable} from "inversify";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy.js";
import WikiPageModel from "../dal/sql/models/wiki-page-model.js";

@injectable()
export class Place extends WikiPage {
	public mapImage: string | null;
	public pixelsPerFoot: number | null;

	@inject(INJECTABLE_TYPES.PlaceFactory)
	factory: EntityFactory<Place, WikiPageModel>;

	type: string = PLACE;

	constructor(
		@inject(INJECTABLE_TYPES.ArticleFactory)
			factory: EntityFactory<Place, WikiPageModel>,
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
