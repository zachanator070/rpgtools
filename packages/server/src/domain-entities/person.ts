import { ModeledPage } from "./modeled-page";
import { PERSON } from "../../../common/src/type-constants";

export class Person extends ModeledPage {
	type: string = PERSON;
}
