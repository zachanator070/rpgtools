import { GraphqlDataloader } from "../graphql-dataloader";
import { Role } from "../../domain-entities/role";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { RoleRepository } from "../../types";
import { RoleAuthorizationRuleset } from "../../security/role-authorization-ruleset";

@injectable()
export class RoleDataLoader extends GraphqlDataloader<Role> {
	@inject(INJECTABLE_TYPES.RoleRepository)
	repository: RoleRepository;
	@inject(INJECTABLE_TYPES.RoleAuthorizationRuleset)
	ruleset: RoleAuthorizationRuleset;
}
