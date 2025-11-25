import { Model } from "../../../domain-entities/model.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ModelRepository} from "../../repository/model-repository.js";
import {FilterCondition} from "../../filter-condition.js";

@injectable()
export class InMemoryModelRepository extends AbstractInMemoryRepository<Model> implements ModelRepository{
    findByWorld(worldId: string): Promise<Model[]> {
        return this.find([new FilterCondition("world", worldId)]);
    }
}
