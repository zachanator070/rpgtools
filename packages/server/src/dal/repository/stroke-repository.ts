import {Repository} from "./repository.js";
import {Stroke} from "../../domain-entities/stroke.js";
import {PaginatedResult} from "../paginated-result.js";


export default interface StrokeRepository extends Repository<Stroke> {
    findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>>;
    deleteAllByGameId(id: string): Promise<void>;
}