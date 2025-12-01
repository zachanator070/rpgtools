import { Place } from "../../../domain-entities/place.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {PlaceRepository} from "../../repository/place-repository.js";

@injectable()
export class InMemoryPlaceRepository extends AbstractInMemoryRepository<Place> implements PlaceRepository {}
