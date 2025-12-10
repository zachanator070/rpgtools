import {DomainEntity, EntityAuthorizationPolicy, EntityFactory, RepositoryAccessor} from "../types.js";
import { TOKEN_ICON } from "@rpgtools/common/src/type-constants.js";
import {inject, injectable} from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import TokenIconModel from "../dal/sql/models/token-icon-model.js";
import { SecurityContext } from "../security/security-context.js";
import { DatabaseContext } from "../dal/database-context.js";

// Stub authorization policy - all checks are done through world authorization
class TokenIconAuthorizationPolicyStub implements EntityAuthorizationPolicy {
	entity: any;

	async canAdmin(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
		return false;
	}

	async canCreate(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
		return false;
	}

	async canRead(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
		return false;
	}

	async canWrite(context: SecurityContext, databaseContext: DatabaseContext): Promise<boolean> {
		return false;
	}
}

@injectable()
export class TokenIcon implements DomainEntity {
	public _id: string;
	public imageId: string;
	public worldId: string;
	public name: string;

	authorizationPolicy: EntityAuthorizationPolicy;
	factory: EntityFactory<TokenIcon, TokenIconModel>;
	type: string = TOKEN_ICON;

	constructor(@inject(INJECTABLE_TYPES.TokenIconFactory)
					factory: EntityFactory<TokenIcon, TokenIconModel>) {
		this.authorizationPolicy = new TokenIconAuthorizationPolicyStub();
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.tokenIconRepository;
	}
}
