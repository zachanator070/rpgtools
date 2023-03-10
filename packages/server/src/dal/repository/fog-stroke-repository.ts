import {Repository} from "./repository";
import {FogStroke} from "../../domain-entities/fog-stroke";
import {PaginatedResult} from "../paginated-result";

export default interface FogStrokeRepository extends Repository<FogStroke> {
    findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>>;
    deleteAllByGameId(id: string): Promise<void>;
}