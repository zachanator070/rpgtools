import { GraphqlDataloader } from "../graphql-dataloader";
import { User } from "../../domain-entities/user";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { UserRepository } from "../../types";
import { UserAuthorizationPolicy } from "../../security/policy/user-authorization-policy";

@injectable()
export class UserDataLoader extends GraphqlDataloader<User> {

	@inject(INJECTABLE_TYPES.UserRepository)
	repository: UserRepository;

}
