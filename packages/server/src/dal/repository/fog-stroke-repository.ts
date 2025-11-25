import {Repository} from "./repository.js";
import {FogStroke} from "../../domain-entities/fog-stroke.js";
import {PaginatedResult} from "../paginated-result.js";

export default interface FogStrokeRepository extends Repository<FogStroke> {
    findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>>;
    deleteAllByGameId(id: string): Promise<void>;
}