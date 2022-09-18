import {Repository} from "./repository";
import {Model} from "../../domain-entities/model";

export interface ModelRepository extends Repository<Model>{
    findByWorld(worldId: string): Promise<Model[]>;
}