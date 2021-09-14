import { DomainEntity } from "../types";
import { ModelAuthorizationRuleset } from "../security/model-authorization-ruleset";
import { MODEL } from "../../../common/src/type-constants";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class Model implements DomainEntity {
	public _id: string;
	public world: string;
	public name: string;
	public depth: number;
	public width: number;
	public height: number;
	public fileName: string;
	public fileId: string | null;
	public notes: string | null;

	@inject(INJECTABLE_TYPES.ModelAuthorizationRuleset)
	authorizationRuleset: ModelAuthorizationRuleset;
	type: string = MODEL;
}
