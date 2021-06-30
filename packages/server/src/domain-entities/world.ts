import { DomainEntity } from "../types";
import { WorldAuthorizationRuleset } from "../security/world-authorization-ruleset";
import { WORLD } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class World implements DomainEntity {
	public _id: string;
	public name: string;
	public wikiPage?: string;
	public rootFolder?: string;
	public roles: string[];
	public pins: string[];
	public type: string = WORLD;

	@inject(INJECTABLE_TYPES.WorldAuthorizationRuleset)
	public authorizationRuleset: WorldAuthorizationRuleset;
}
