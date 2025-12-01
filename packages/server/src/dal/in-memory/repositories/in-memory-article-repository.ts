import { Article } from "../../../domain-entities/article.js";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository.js";
import {ArticleRepository} from "../../repository/article-repository.js";
import {FilterCondition} from "../../filter-condition.js";

@injectable()
export class InMemoryArticleRepository
	extends AbstractInMemoryRepository<Article>
	implements ArticleRepository {

	findOneByNameAndWorld(name: string, worldId: string): Promise<Article> {
		return this.findOne([
			new FilterCondition("name", name),
			new FilterCondition("world", worldId),
		]);
	}
}
