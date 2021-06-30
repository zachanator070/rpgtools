import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { FileRepository } from "../../types";
import { FileAuthorizationRuleset } from "../../security/file-authorization-ruleset";

@injectable()
export class FileDataLoader extends GraphqlDataloader<File> {
	@inject(INJECTABLE_TYPES.FileRepository)
	repository: FileRepository;
	@inject(INJECTABLE_TYPES.FileAuthorizationRuleset)
	ruleset: FileAuthorizationRuleset;
}
