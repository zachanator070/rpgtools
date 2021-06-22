import { GraphqlDataloader } from "../graphql-dataloader";
import { File } from "../../domain-entities/file";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { FileRepository } from "../../types";
import { AllowAllRuleset } from "../../security/allow-all-ruleset";

export class FileDataLoader extends GraphqlDataloader<File> {
	constructor(@inject(INJECTABLE_TYPES.FileRepository) repo: FileRepository) {
		super(repo, new AllowAllRuleset());
	}
}
