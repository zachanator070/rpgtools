import {injectable} from "inversify";
import {AbstractInMemoryRepository} from "./abstract-in-memory-repository.js";
import {FogStroke} from "../../../domain-entities/fog-stroke.js";
import FogStrokeRepository from "../../repository/fog-stroke-repository.js";
import {FilterCondition} from "../../filter-condition.js";
import {PaginatedResult} from "../../paginated-result.js";


@injectable()
export default class InMemoryFogStrokeRepository extends AbstractInMemoryRepository<FogStroke> implements FogStrokeRepository {
    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        const toDelete = [...this.items.entries()].filter(([id, stroke]) => stroke.game !== id );
        for(const [id, stroke] of toDelete) {
            await this.delete(stroke);
        }
    }

}