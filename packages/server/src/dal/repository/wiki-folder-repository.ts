import {Repository} from "./repository";
import {WikiFolder} from "../../domain-entities/wiki-folder";

export interface WikiFolderRepository extends Repository<WikiFolder> {
    findOneWithPage(pageId: string): Promise<WikiFolder>;
    findOneWithChild(wikiFolderId: string): Promise<WikiFolder>;
}