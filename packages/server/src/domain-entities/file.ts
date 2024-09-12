import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import { Readable } from "stream";
import { FILE } from "@rpgtools/common/src/type-constants";
import { FileAuthorizationPolicy } from "../security/policy/file-authorization-policy.js";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {Repository} from "../dal/repository/repository.js";
import FileModel from "../dal/sql/models/file-model.js";

@injectable()
export class File implements DomainEntity {
	_id: string;
	filename: string;
	mimeType: string;
	readStream: Readable;

	authorizationPolicy: FileAuthorizationPolicy;
	factory: EntityFactory<File, FileModel>;
	type: string = FILE;

	constructor(@inject(INJECTABLE_TYPES.FileAuthorizationPolicy)
					authorizationPolicy: FileAuthorizationPolicy,
				@inject(INJECTABLE_TYPES.FileFactory)
					factory: EntityFactory<File, FileModel>) {
		this.authorizationPolicy = authorizationPolicy;
		this.factory = factory;
	}

	getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
		return accessor.fileRepository;
	}
}
