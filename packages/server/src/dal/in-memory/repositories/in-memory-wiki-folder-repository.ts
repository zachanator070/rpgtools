import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {FILTER_CONDITION_OPERATOR_IN, FILTER_CONDITION_REGEX, FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryWikiFolderRepository extends AbstractInMemoryRepository<WikiFolder> implements WikiFolderRepository {

    findOneWithPage(pageId: string): Promise<WikiFolder> {
        return this.findOne([new FilterCondition("pages", pageId, FILTER_CONDITION_OPERATOR_IN)]);
    }

    findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
        return this.findOne([new FilterCondition("children", wikiFolderId, FILTER_CONDITION_OPERATOR_IN)]);
    }

    findByWorldAndName(worldId: string, name?: string): Promise<WikiFolder[]> {
        const conditions: FilterCondition[] = [new FilterCondition("world", worldId)];
        if (name) {
            conditions.push(new FilterCondition("name", name, FILTER_CONDITION_REGEX));
        }
        return this.find(conditions);
    }

    findOneByNameAndWorld(name: string, worldId: string): Promise<WikiFolder> {
        return this.findOne([
            new FilterCondition("name", name),
            new FilterCondition("world", worldId),
        ]);
    }

}
