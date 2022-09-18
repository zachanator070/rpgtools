import { Model } from "../../../domain-entities/model";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {ModelRepository} from "../../repository/model-repository";
import {FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryModelRepository extends AbstractInMemoryRepository<Model> implements ModelRepository{
    findByWorld(worldId: string): Promise<Model[]> {
        return this.find([new FilterCondition("world", worldId)]);
    }
}
