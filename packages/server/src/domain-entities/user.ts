import { DomainEntity } from "../types";
import { UserAuthorizationRuleset } from "../security/ruleset/user-authorization-ruleset";
import { USER } from "@rpgtools/common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class User implements DomainEntity {
	public _id: string;
	public email: string;
	public username: string;
	public password: string;
	public tokenVersion: string | null;
	public currentWorld: string | null;
	public roles: string[];
	public permissions: string[];

	@inject(INJECTABLE_TYPES.UserAuthorizationRuleset)
	authorizationRuleset: UserAuthorizationRuleset;

	type: string = USER;
}
