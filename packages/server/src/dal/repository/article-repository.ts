import {Repository} from "./repository";
import {Article} from "../../domain-entities/article";

export interface ArticleRepository extends Repository<Article>{
    findOneByNameAndWorld(name: string, worldId: string): Promise<Article>;
}