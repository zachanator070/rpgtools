import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { UserRepository } from "../../types";
import { UserAuthorizationRuleset } from "../../security/user-authorization-ruleset";

export class UserDataLoader extends GraphqlDataloader<User> {
	constructor(@inject(INJECTABLE_TYPES.UserRepository) repo: UserRepository) {
		super(repo, new UserAuthorizationRuleset());
	}
}
