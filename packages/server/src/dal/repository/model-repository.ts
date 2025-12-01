import {Repository} from "./repository.js";
import {Model} from "../../domain-entities/model.js";

export interface ModelRepository extends Repository<Model>{
    findByWorld(worldId: string): Promise<Model[]>;
}