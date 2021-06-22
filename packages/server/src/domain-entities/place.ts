import { WikiPage } from "./wiki-page";
import { PLACE } from "../../../common/src/type-constants";

export class Place extends WikiPage {
	public mapImage?: string;
	public pixelsPerFoot?: number;

	type: string = PLACE;

	constructor(
		id: string,
		name: string,
		worldId: string,
		coverImageId: string,
		contentId: string,
		mapImageId: string,
		pixelsPerFoot: number
	) {
		super(id, name, worldId, coverImageId, contentId);
		this.mapImage = mapImageId;
		this.pixelsPerFoot = pixelsPerFoot;
	}
}
