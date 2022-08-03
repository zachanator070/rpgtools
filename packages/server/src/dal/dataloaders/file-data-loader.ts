import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FileRepository } from "../../types";
import { FileAuthorizationPolicy } from "../../security/policy/file-authorization-policy";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {

	@inject(INJECTABLE_TYPES.FileRepository)
	declare repository: FileRepository;

}
