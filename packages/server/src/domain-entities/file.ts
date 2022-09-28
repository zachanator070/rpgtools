import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import { Readable } from "stream";
import { FILE } from "@rpgtools/common/src/type-constants";
import { FileAuthorizationPolicy } from "../security/policy/file-authorization-policy";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";
import {Repository} from "../dal/repository/repository";
import {FileDocument} from "../dal/mongodb/models/file";

@injectable()
export class File implements DomainEntity {
	_id: string;
	filename: string;
	mimeType: string;
	readStream: Readable;

	authorizationPolicy: FileAuthorizationPolicy;
	factory: EntityFactory<File, FileDocument>;
	type: string = FILE;

	constructor(@inject(INJECTABLE_TYPES.FileAuthorizationPolicy)
					authorizationPolicy: FileAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.FileFactory)
					factory: EntityFactory<File, FileDocument>) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.fileRepository;
	}
}
