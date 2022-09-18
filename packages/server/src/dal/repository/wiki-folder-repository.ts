import {Repository} from "./repository";
import {WikiFolder} from "../../domain-entities/wiki-folder";

export interface WikiFolderRepository extends Repository<WikiFolder> {
    findOneWithPage(pageId: string): Promise<WikiFolder>;
    findOneWithChild(wikiFolderId: string): Promise<WikiFolder>;
    findByWorldAndName(worldId: string, name?: string): Promise<WikiFolder[]>;
    findOneByNameAndWorld(name: string, worldId: string): Promise<WikiFolder>;
}