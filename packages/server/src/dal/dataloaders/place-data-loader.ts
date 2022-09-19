import { GraphqlDataloader } from "../graphql-dataloader";
import { Place } from "../../domain-entities/place";
import { injectable } from "inversify";
import {Repository} from "../repository/repository";
import {DatabaseContext} from "../database-context";

@injectable()
export class PlaceDataLoader extends GraphqlDataloader<Place> {
	getRepository(databaseContext: DatabaseContext): Repository<Place> {
		return databaseContext.placeRepository;
	}

}
