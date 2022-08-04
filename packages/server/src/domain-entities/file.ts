import {DomainEntity, Factory, Repository, UnitOfWork} from "../types";
import { Readable } from "stream";
import { FILE } from "@rpgtools/common/src/type-constants";
import { FileAuthorizationPolicy } from "../security/policy/file-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

@injectable()
export class File implements DomainEntity {
	_id: string;
	filename: string;
	mimeType: string;
	readStream: Readable;

	authorizationPolicy: FileAuthorizationPolicy;
	factory: Factory<File>;
	type: string = FILE;

	constructor(@inject(INJECTABLE_TYPES.FileAuthorizationPolicy)
					authorizationPolicy: FileAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.FileFactory)
					factory: Factory<File>) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.fileRepository;
	}
}
