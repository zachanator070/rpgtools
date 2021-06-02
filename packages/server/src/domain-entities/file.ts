import { DomainEntity } from "../types";
import { Readable } from "stream";

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
}
