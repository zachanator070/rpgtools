import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { World } from "./world";
import { ModelAuthorizationRuleset } from "../security/model-authorization-ruleset";
import { MODEL } from "../../../common/src/type-constants";

export class Model implements DomainEntity {
	public _id: string;
	public world: string;
	public name: string;
	public depth: number;
	public width: number;
	public height: number;
	public fileName: string;
	public fileId?: string;
	public notes?: string;

	authorizationRuleset: EntityAuthorizationRuleset<Model, World> = new ModelAuthorizationRuleset();
	type: string = MODEL;

	constructor(
		id: string,
		worldId: string,
		name: string,
		depth: number,
		width: number,
		height: number,
		fileName: string,
		fileId: string,
		notes: string
	) {
		this._id = id;
		this.world = worldId;
		this.name = name;
		this.depth = depth;
		this.width = width;
		this.height = height;
		this.fileName = fileName;
		this.fileId = fileId;
		this.notes = notes;
	}
}
