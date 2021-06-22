import { GraphqlDataloader } from "../graphql-dataloader";
import { Role } from "../../domain-entities/role";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { RoleRepository } from "../../types";
import { RoleAuthorizationRuleset } from "../../security/role-authorization-ruleset";

export class RoleDataLoader extends GraphqlDataloader<Role> {
	constructor(@inject(INJECTABLE_TYPES.RoleRepository) repo: RoleRepository) {
		super(repo, new RoleAuthorizationRuleset());
	}
}
