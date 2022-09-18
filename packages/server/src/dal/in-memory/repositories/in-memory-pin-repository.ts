import { Pin } from "../../../domain-entities/pin";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {PinRepository} from "../../repository/pin-repository";
import {PaginatedResult} from "../../paginated-result";
import {FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryPinRepository extends AbstractInMemoryRepository<Pin> implements PinRepository {
    findByWorldPaginated(worldId: string, page: number): Promise<PaginatedResult<Pin>> {
        return this.findPaginated([new FilterCondition('world', worldId)], page);
    }

    findOneByMapAndPage(mapId: string, pageId: string): Promise<Pin> {
        return this.findOne([
            new FilterCondition("map", mapId),
            new FilterCondition("page", pageId),
        ]);
    }
}
