import {DomainEntity, Repository, UnitOfWork} from "../types";
import { CHUNK } from "@rpgtools/common/src/type-constants";
import { ChunkAuthorizationPolicy } from "../security/policy/chunk-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Chunk implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public fileId: string;
	public image: string;

	authorizationPolicy: ChunkAuthorizationPolicy;
	type: string = CHUNK;

	constructor(@inject(INJECTABLE_TYPES.ChunkAuthorizationPolicy)
					authorizationPolicy: ChunkAuthorizationPolicy) {
		this.authorizationPolicy = authorizationPolicy;
	}


	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.chunkRepository;
	}
}
