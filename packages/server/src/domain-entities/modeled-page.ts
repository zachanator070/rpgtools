import { WikiPage } from "./wiki-page";

export abstract class ModeledPage extends WikiPage {
	public pageModel: string | null;
	public modelColor: string | null;
}
