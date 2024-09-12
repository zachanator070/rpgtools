import {PathNode} from "./game.js";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import FogStrokeModel from "../dal/sql/models/game/fog-stroke-model.js";
import {Repository} from "../dal/repository/repository.js";
import {FOG_STROKE} from "@rpgtools/common/src/type-constants";
import {inject} from "inversify";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import FogStrokeAuthorization from "../security/policy/fog-stroke-authorization-policy.js";


export class FogStroke implements DomainEntity {

	type = FOG_STROKE;

    public _id: string;
	public game: string;
    public path: PathNode[];
    public size: number;
    public strokeType: string;

	authorizationPolicy: FogStrokeAuthorization;

	factory: EntityFactory<FogStroke, FogStrokeModel>;

	constructor(
		@inject(INJECTABLE_TYPES.FogStrokeAuthorizationPolicy)
				authorizationPolicy: FogStrokeAuthorization,
		@inject(INJECTABLE_TYPES.FogStrokeFactory)
			factory: EntityFactory<FogStroke, FogStrokeModel>
	) {
		this.authorizationPolicy = authorizationPolicy;
		this.authorizationPolicy.entity = this;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<FogStroke> {
		return accessor.fogStrokeRepository;
	}

}