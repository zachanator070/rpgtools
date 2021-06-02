import { WikiPage } from "./wiki-page";

export abstract class ModeledPage extends WikiPage {
	public model?: string;
	public modelColor?: string;

	constructor(
		id: string,
		name: string,
		world: string,
		coverImageId: string,
		contentId: string,
		modelId: string,
		modelColor: string
	) {
		super(id, name, world, coverImageId, contentId);
		this.model = modelId;
		this.modelColor = modelColor;
	}
}
