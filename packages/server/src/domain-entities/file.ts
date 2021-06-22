import { DomainEntity, EntityAuthorizationRuleset } from "../types";
import { Readable } from "stream";
import { FILE } from "../../../common/src/type-constants";
import { World } from "./world";
import { FileAuthorizationRuleset } from "../security/file-authorization-ruleset";

export class File implements DomainEntity {
	_id: string;
	filename: string;
	mimeType: string;
	readStream: Readable;

	constructor(id: string, filename: string, readStream: Readable, mimeType: string = "") {
		this._id = id;
		this.filename = filename;
		this.readStream = readStream;
		this.mimeType = mimeType;
	}

	authorizationRuleset: EntityAuthorizationRuleset<File, World> = new FileAuthorizationRuleset();
	type: string = FILE;
}
