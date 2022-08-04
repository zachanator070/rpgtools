import {ChunkFactory, DomainEntity, Factory, Repository, UnitOfWork} from "../types";
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
	factory: ChunkFactory;
	type: string = CHUNK;

	constructor(
		@inject(INJECTABLE_TYPES.ChunkAuthorizationPolicy)
		authorizationPolicy: ChunkAuthorizationPolicy,
		@inject(INJECTABLE_TYPES.ChunkFactory)
		factory: ChunkFactory
	) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}


	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.chunkRepository;
	}
}
