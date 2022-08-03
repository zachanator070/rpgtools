import { AllowAllPolicy } from "./allow-all-policy";
import { Image } from "../../domain-entities/image";
import { injectable } from "inversify";

@injectable()
export class ImageAuthorizationPolicy extends AllowAllPolicy<Image> {}
