import { GraphqlDataloader } from "../graphql-dataloader";
import { Image } from "../../domain-entities/image";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../../di/injectable-types";
import { ImageRepository } from "../../types";
import { ImageAuthorizationPolicy } from "../../security/policy/image-authorization-policy";

@injectable()
export class ImageDataLoader extends GraphqlDataloader<Image> {

	@inject(INJECTABLE_TYPES.ImageRepository)
	repository: ImageRepository;

}
