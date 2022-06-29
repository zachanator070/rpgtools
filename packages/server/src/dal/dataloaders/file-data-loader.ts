import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { FileRepository } from "../../types";
import { FileAuthorizationRuleset } from "../../security/ruleset/file-authorization-ruleset";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {
	@inject(INJECTABLE_TYPES.FileRepository)
	declare repository: FileRepository;
	@inject(INJECTABLE_TYPES.FileAuthorizationRuleset)
	declare ruleset: FileAuthorizationRuleset;
}
