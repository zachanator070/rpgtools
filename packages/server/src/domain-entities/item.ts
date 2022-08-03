import { ModeledPage } from "./modeled-page";
import { ITEM } from "@rpgtools/common/src/type-constants";
import { injectable } from "inversify";
import {DomainEntity, Repository, UnitOfWork} from "../types";

@injectable()
export class Item extends ModeledPage {
	type: string = ITEM;

	getRepository(unitOfWork: UnitOfWork): Repository<DomainEntity> {
		return unitOfWork.itemRepository;
	}
}
