import {Repository} from "./repository";
import {Stroke} from "../../domain-entities/stroke";
import {PaginatedResult} from "../paginated-result";


export default interface StrokeRepository extends Repository<Stroke> {
    findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>>;
    deleteAllByGameId(id: string): Promise<void>;
}