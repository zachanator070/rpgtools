import {Repository} from "./repository.js";
import {Pin} from "../../domain-entities/pin.js";
import {PaginatedResult} from "../paginated-result.js";

export interface PinRepository extends Repository<Pin>{
    findByWorldPaginated(worldId: string, page: number): Promise<PaginatedResult<Pin>>;
    findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin>;
}