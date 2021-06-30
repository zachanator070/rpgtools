import { WikiPage } from "./wiki-page";
import { PLACE } from "../../../common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Place extends WikiPage {
	public mapImage?: string;
	public pixelsPerFoot?: number;

	type: string = PLACE;
}
