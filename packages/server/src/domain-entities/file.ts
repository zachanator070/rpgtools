import { DomainEntity } from "../types";
import { Readable } from "stream";
import { FILE } from "../../../common/src/type-constants";
import { FileAuthorizationRuleset } from "../security/file-authorization-ruleset";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../injectable-types";

@injectable()
export class File implements DomainEntity {
	_id: string;
	filename: string;
	mimeType: string;
	readStream: Readable;

	@inject(INJECTABLE_TYPES.FileAuthorizationRuleset)
	authorizationRuleset: FileAuthorizationRuleset;
	type: string = FILE;
}
