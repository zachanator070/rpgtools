import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { ModelAuthorizationPolicy } from "../security/policy/model-authorization-policy";
import { MODEL } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Model implements DomainEntity {
	public _id: string;
	public world: string;
	public name: string;
	public depth: number;
	public width: number;
	public height: number;
	public fileName: string;
	public fileId: string | null;
	public notes: string | null;

	authorizationPolicy: ModelAuthorizationPolicy;
	factory: Factory<Model>;
	type: string = MODEL;

	constructor(@inject(INJECTABLE_TYPES.ModelAuthorizationPolicy)
					authorizationPolicy: ModelAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ModelFactory)
					factory: Factory<Model>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.modelRepository;
	}
}
