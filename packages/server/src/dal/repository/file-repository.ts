import {Repository} from "./repository";
import {File} from "../../domain-entities/file";

export interface FileRepository extends Repository<File> {
    findByContent(searchTerms: string[]): Promise<File[]>;
}