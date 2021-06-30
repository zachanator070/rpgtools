import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { UserRepository } from "../../types";
import { UserAuthorizationRuleset } from "../../security/user-authorization-ruleset";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {
	@inject(INJECTABLE_TYPES.UserRepository)
	repository: UserRepository;
	@inject(INJECTABLE_TYPES.UserAuthorizationRuleset)
	ruleset: UserAuthorizationRuleset;
}
