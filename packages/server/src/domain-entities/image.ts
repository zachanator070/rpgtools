import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { World } from "./world";
import { IMAGE } from "../../../common/src/type-constants";
import { ImageAuthorizationRuleset } from "../security/image-authorization-ruleset";

export class Image implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public width: number;
	public height: number;
	public chunkWidth: number;
	public chunkHeight: number;
	public chunks: string[];
	public icon?: string;

	authorizationRuleset: EntityAuthorizationRuleset<Image, World> = new ImageAuthorizationRuleset();
	type: string = IMAGE;

	constructor(
		id: string,
		name: string,
		worldId: string,
		width: number,
		height: number,
		chunkWidth: number,
		chunkHeight: number,
		chunkIds: string[],
		iconId: string
	) {
		this._id = id;
		this.name = name;
		this.world = worldId;
		this.width = width;
		this.height = height;
		this.chunkWidth = chunkWidth;
		this.chunkHeight = chunkHeight;
		this.chunks = chunkIds;
		this.icon = iconId;
	}
}
