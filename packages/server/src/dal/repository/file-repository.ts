import {Repository} from "./repository.js";
import {File} from "../../domain-entities/file.js";

export interface FileRepository extends Repository<File> {
}