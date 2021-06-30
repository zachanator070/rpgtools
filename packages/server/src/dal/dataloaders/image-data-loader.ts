import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../injectable-types";
import { ImageRepository } from "../../types";
import { ImageAuthorizationRuleset } from "../../security/image-authorization-ruleset";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {
	@inject(INJECTABLE_TYPES.ImageRepository)
	repository: ImageRepository;
	@inject(INJECTABLE_TYPES.ImageAuthorizationRuleset)
	ruleset: ImageAuthorizationRuleset;
}
