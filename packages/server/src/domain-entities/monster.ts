import { ModeledPage } from "./modeled-page";
import { MONSTER } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";

@injectable()
export class Monster extends ModeledPage {
	type: string = MONSTER;
}
