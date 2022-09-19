import {DomainEntity, Factory, RepositoryAccessor} from "../types";
import { IMAGE } from "@rpgtools/common/src/type-constants";
import { ImageAuthorizationPolicy } from "../security/policy/image-authorization-policy";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";

@injectable()
export class Image implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public width: number;
	public height: number;
	public chunkWidth: number;
	public chunkHeight: number;
	public chunks: string[];
	public icon: string | null;

	authorizationPolicy: ImageAuthorizationPolicy;
	factory: Factory<Image>;

	type: string = IMAGE;

	constructor(@inject(INJECTABLE_TYPES.ImageAuthorizationPolicy)
					authorizationPolicy: ImageAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ImageFactory)
					factory: Factory<Image>) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.imageRepository;
	}
}
