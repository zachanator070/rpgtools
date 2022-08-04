import { GraphqlDataloader } from "../graphql-dataloader";
import { Place } from "../../domain-entities/place";
import { injectable } from "inversify";
import {Repository, UnitOfWork} from "../../types";

@injectable()
export class PlaceDataLoader extends GraphqlDataloader<Place> {
	getRepository(unitOfWork: UnitOfWork): Repository<Place> {
		return unitOfWork.placeRepository;
	}

}
