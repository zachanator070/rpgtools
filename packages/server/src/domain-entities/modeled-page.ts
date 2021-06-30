import { WikiPage } from "./wiki-page";

export abstract class ModeledPage extends WikiPage {
	public model?: string;
	public modelColor?: string;
}
