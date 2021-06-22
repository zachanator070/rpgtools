import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { CHUNK } from "../../../common/src/type-constants";
import { Image } from "./image";
import { ChunkAuthorizationRuleset } from "../security/chunk-authorization-ruleset";

export class Chunk implements DomainEntity {
	public _id: string;
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public fileId: string;
	public image: string;

	constructor(
		id: string,
		x: number,
		y: number,
		width: number,
		height: number,
		fileId: string,
		imageId: string
	) {
		this._id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.fileId = fileId;
		this.image = imageId;
	}

	authorizationRuleset: EntityAuthorizationRuleset<Chunk, Image> = new ChunkAuthorizationRuleset();
	type: string = CHUNK;
}
