import {Repository} from "./repository";
import {Pin} from "../../domain-entities/pin";
import {PaginatedResult} from "../paginated-result";

export interface PinRepository extends Repository<Pin>{
    findByWorldPaginated(worldId: string, page: number): Promise<PaginatedResult<Pin>>;
    findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin>;
}