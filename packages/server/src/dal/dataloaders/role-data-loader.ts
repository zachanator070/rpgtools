import { GraphqlDataloader } from "../graphql-dataloader";
import { Role } from "../../domain-entities/role";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { RoleRepository } from "../../types";
import { RoleAuthorizationPolicy } from "../../security/policy/role-authorization-policy";

@injectable()
export class RoleDataLoader extends GraphqlDataloader<Role> {

	@inject(INJECTABLE_TYPES.RoleRepository)
	repository: RoleRepository;

}
