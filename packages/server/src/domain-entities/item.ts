import { ModeledPage } from "./modeled-page";
import { ITEM } from "../../../common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Item extends ModeledPage {
	type: string = ITEM;
}
