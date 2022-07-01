import { Model } from "../../../domain-entities/model";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";

@injectable()
export class InMemoryModelRepository extends AbstractInMemoryRepository<Model> {}
