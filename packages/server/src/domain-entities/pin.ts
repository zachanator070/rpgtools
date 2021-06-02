import { DomainEntity } from "../types";

export class Pin implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public map: string;
	public page?: string;

	constructor(id: string, x: number, y: number, mapId: string, pageId: string) {
		this._id = id;
		this.x = x;
		this.y = y;
		this.map = mapId;
		this.page = pageId;
	}
}
