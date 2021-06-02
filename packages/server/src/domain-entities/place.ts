import { WikiPage } from "./wiki-page";

export class Place extends WikiPage {
	public mapImage?: string;
	public pixelsPerFoot?: number;

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
