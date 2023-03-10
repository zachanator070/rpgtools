import {AbstractInMemoryRepository} from "./abstract-in-memory-repository";
import {Stroke} from "../../../domain-entities/stroke";
import StrokeRepository from "../../repository/stroke-repository";
import {FilterCondition} from "../../filter-condition";
import {injectable} from "inversify";
import {PaginatedResult} from "../../paginated-result";

@injectable()
export default class InMemoryStrokeRepository extends AbstractInMemoryRepository<Stroke> implements StrokeRepository {

    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<Stroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        const toDelete = [...this.items.entries()].filter(([id, stroke]) => stroke.game !== id );
        for(let [id, stroke] of toDelete) {
            await this.delete(stroke);
        }
    }
}