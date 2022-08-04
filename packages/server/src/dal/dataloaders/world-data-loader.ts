import { GraphqlDataloader } from "../graphql-dataloader";
import { World } from "../../domain-entities/world";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class WorldDataLoader extends GraphqlDataloader<World> {
	getRepository(unitOfWork: UnitOfWork): Repository<World> {
		return unitOfWork.worldRepository;
	}

}
