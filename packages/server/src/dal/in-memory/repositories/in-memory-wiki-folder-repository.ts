import { WikiFolder } from "../../../domain-entities/wiki-folder";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {WikiFolderRepository} from "../../repository/wiki-folder-repository";
import {FilterCondition} from "../../filter-condition";

@injectable()
export class InMemoryWikiFolderRepository extends AbstractInMemoryRepository<WikiFolder> implements WikiFolderRepository {
    findOneWithChild(wikiFolderId: string): Promise<WikiFolder> {
        return this.findOne([new FilterCondition('children', wikiFolderId)]);
    }

    findOneWithPage(pageId: string): Promise<WikiFolder> {
        return this.findOne([new FilterCondition('page', pageId)]);
    }

}
