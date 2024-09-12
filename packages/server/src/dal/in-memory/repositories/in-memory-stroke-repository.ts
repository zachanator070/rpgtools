import {AbstractInMemoryRepository} from "./abstract-in-memory-repository.js";
import {Stroke} from "../../../domain-entities/stroke.js";
import StrokeRepository from "../../repository/stroke-repository.js";
import {FilterCondition} from "../../filter-condition.js";
import {injectable} from "inversify";
import {PaginatedResult} from "../../paginated-result.js";

@injectable()
export default class InMemoryStrokeRepository extends AbstractInMemoryRepository<Stroke> implements StrokeRepository {

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        const toDelete = [...this.items.entries()].filter(([id, stroke]) => stroke.game !== id );
        for(const [id, stroke] of toDelete) {
            await this.delete(stroke);
        }
    }
}