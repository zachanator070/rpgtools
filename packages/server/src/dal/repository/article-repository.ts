import {Repository} from "./repository.js";
import {Article} from "../../domain-entities/article.js";

export interface ArticleRepository extends Repository<Article>{
    findOneByNameAndWorld(name: string, worldId: string): Promise<Article>;
}