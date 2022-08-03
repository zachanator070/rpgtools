import { AllowAllPolicy } from "./allow-all-policy";
import { File } from "../../domain-entities/file";
import { injectable } from "inversify";

@injectable()
export class FileAuthorizationPolicy extends AllowAllPolicy<File> {}
