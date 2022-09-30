import {AclEntry, DomainEntity, EntityFactory, Factory, PermissionControlledEntity, RepositoryAccessor} from "../types";
import { ModelAuthorizationPolicy } from "../security/policy/model-authorization-policy";
import { MODEL } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {ModelDocument} from "../dal/mongodb/models/model";
import ModelModel from "../dal/sql/models/model-model";

@injectable()
export class Model implements PermissionControlledEntity {
	public _id: string;
	public world: string;
	public name: string;
	public depth: number;
	public width: number;
	public height: number;
	public fileName: string;
	public fileId: string | null;
	public notes: string | null;
	public acl: AclEntry[];

	authorizationPolicy: ModelAuthorizationPolicy;
	factory: EntityFactory<Model, ModelDocument, ModelModel>;
	type: string = MODEL;

	constructor(@inject(INJECTABLE_TYPES.ModelAuthorizationPolicy)
					authorizationPolicy: ModelAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.ModelFactory)
					factory: EntityFactory<Model, ModelDocument, ModelModel>) {
		authorizationPolicy.entity = this;
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.modelRepository;
	}
}
