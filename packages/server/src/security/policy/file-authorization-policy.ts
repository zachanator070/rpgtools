import { AllowAllPolicy } from "./allow-all-policy";
import { injectable } from "inversify";

@injectable()
export class FileAuthorizationPolicy extends AllowAllPolicy {}
