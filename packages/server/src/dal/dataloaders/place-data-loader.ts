import { GraphqlDataloader } from "../graphql-dataloader.js";
import { Place } from "../../domain-entities/place.js";
import { injectable } from "inversify";
import {Repository} from "../repository/repository.js";
import {DatabaseContext} from "../database-context.js";

@injectable()
export class PlaceDataLoader extends GraphqlDataloader<Place> {
	getRepository(databaseContext: DatabaseContext): Repository<Place> {
		return databaseContext.placeRepository;
	}

}
