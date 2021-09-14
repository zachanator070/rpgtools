import { DomainEntity } from "../types";
import { PinAuthorizationRuleset } from "../security/pin-authorization-ruleset";
import { PIN } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page: string | null;

	@inject(INJECTABLE_TYPES.PinAuthorizationRuleset)
	authorizationRuleset: PinAuthorizationRuleset;
	type: string = PIN;
}
