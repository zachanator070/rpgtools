import { ModeledPage } from "./modeled-page";
import { PERSON } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Person extends ModeledPage {
	type: string = PERSON;
}
