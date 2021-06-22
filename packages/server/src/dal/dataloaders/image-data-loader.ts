import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import { inject } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ImageRepository } from "../../types";
import { AllowAllRuleset } from "../../security/allow-all-ruleset";

export class ImageDataLoader extends GraphqlDataloader<Image> {
	constructor(@inject(INJECTABLE_TYPES.ImageRepository) repo: ImageRepository) {
		super(repo, new AllowAllRuleset());
	}
}
