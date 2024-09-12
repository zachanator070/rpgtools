import { WikiPage } from "./wiki-page.js";

export abstract class ModeledPage extends WikiPage {
	public pageModel: string | null;
	public modelColor: string | null;
}
