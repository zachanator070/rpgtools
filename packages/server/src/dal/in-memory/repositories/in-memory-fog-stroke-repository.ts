import {injectable} from "inversify";
import {AbstractInMemoryRepository} from "./abstract-in-memory-repository";
import {FogStroke} from "../../../domain-entities/fog-stroke";
import FogStrokeRepository from "../../repository/fog-stroke-repository";
import {FilterCondition} from "../../filter-condition";
import {PaginatedResult} from "../../paginated-result";


@injectable()
export default class InMemoryFogStrokeRepository extends AbstractInMemoryRepository<FogStroke> implements FogStrokeRepository {
    async findAllByGameIdPaginated(id: string, page: number): Promise<PaginatedResult<FogStroke>> {
        return this.findPaginated([new FilterCondition('game', id)], page);
    }

    async deleteAllByGameId(id: string): Promise<void> {
        const toDelete = [...this.items.entries()].filter(([id, stroke]) => stroke.game !== id );
        for(let [id, stroke] of toDelete) {
            await this.delete(stroke);
        }
    }

}