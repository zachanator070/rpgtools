import { DomainEntity } from "../types";
import { IMAGE } from "@rpgtools/common/src/type-constants";
import { ImageAuthorizationRuleset } from "../security/ruleset/image-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class Image implements DomainEntity {
	public _id: string;
	public name: string;
	public world: string;
	public width: number;
	public height: number;
	public chunkWidth: number;
	public chunkHeight: number;
	public chunks: string[];
	public icon: string | null;

	@inject(INJECTABLE_TYPES.ImageAuthorizationRuleset)
	authorizationRuleset: ImageAuthorizationRuleset;

	type: string = IMAGE;
}
