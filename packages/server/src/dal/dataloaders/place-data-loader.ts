import { GraphqlDataloader } from "../graphql-dataloader";
import { Place } from "../../domain-entities/place";
import { injectable } from "inversify";
import {UnitOfWork} from "../../types";
import {Repository} from "../repository/repository";

@injectable()
export class PlaceDataLoader extends GraphqlDataloader<Place> {
	getRepository(unitOfWork: UnitOfWork): Repository<Place> {
		return unitOfWork.placeRepository;
	}

}
