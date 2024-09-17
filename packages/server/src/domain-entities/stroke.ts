import {PathNode} from "./game.js";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {Repository} from "../dal/repository/repository.js";
import StrokeModel from "../dal/sql/models/game/stroke-model.js";
import {inject} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import {STROKE} from "@rpgtools/common/src/type-constants.js";
import StrokeAuthorizationPolicy from "../security/policy/stroke-authorization-policy.js";

export class Stroke implements DomainEntity {

	type = STROKE;

	authorizationPolicy: StrokeAuthorizationPolicy;

	@inject(INJECTABLE_TYPES.StrokeFactory)
	factory: EntityFactory<Stroke, StrokeModel>;

    public _id: string;
	public game: string;
    public path: PathNode[];
    public color: string;
    public size: number;
    public fill: boolean;
    public strokeType: string;

	constructor(
		@inject(INJECTABLE_TYPES.StrokeAuthorizationPolicy)
			authorizationPolicy: StrokeAuthorizationPolicy,
		@inject(INJECTABLE_TYPES.StrokeFactory)
			factory: EntityFactory<Stroke, StrokeModel>
	) {
		this.authorizationPolicy = authorizationPolicy;
		this.authorizationPolicy.entity = this;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.strokeRepository;
	}

}