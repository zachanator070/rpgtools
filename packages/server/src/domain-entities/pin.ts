import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { PinAuthorizationRuleset } from "../security/pin-authorization-ruleset";
import { World } from "./world";
import { Place } from "./place";
import { PIN } from "../../../common/src/type-constants";

export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page?: string;

	authorizationRuleset: EntityAuthorizationRuleset<Pin, Place> = new PinAuthorizationRuleset();
	type: string = PIN;

	constructor(id: string, x: number, y: number, mapId: string, pageId: string) {
		this._id = id;
		this.x = x;
		this.y = y;
		this.map = mapId;
		this.page = pageId;
	}
}
