import { Place } from "../../../domain-entities/place";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryPlaceRepository extends AbstractInMemoryRepository<Place> {}
