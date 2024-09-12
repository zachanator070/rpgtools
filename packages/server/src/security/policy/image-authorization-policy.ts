import { AllowAllPolicy } from "./allow-all-policy.js";
import { injectable } from "inversify";

@injectable()
export class ImageAuthorizationPolicy extends AllowAllPolicy {}
