import {DomainEntity, Repository, UnitOfWork} from "../types";
import { IMAGE } from "@rpgtools/common/src/type-constants";
import { ImageAuthorizationPolicy } from "../security/policy/image-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

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

	type: string = IMAGE;

	constructor(@inject(INJECTABLE_TYPES.ImageAuthorizationPolicy)
					authorizationPolicy: ImageAuthorizationPolicy) {
		this.authorizationPolicy = authorizationPolicy;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.imageRepository;
	}
}
