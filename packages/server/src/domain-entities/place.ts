import { WikiPage } from "./wiki-page";
import { PLACE } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Place extends WikiPage {
	public mapImage: string | null;
	public pixelsPerFoot: number | null;

	type: string = PLACE;
}
