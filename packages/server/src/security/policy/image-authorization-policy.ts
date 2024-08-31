import { AllowAllPolicy } from "./allow-all-policy";
import { injectable } from "inversify";

@injectable()
export class ImageAuthorizationPolicy extends AllowAllPolicy {}
