import { Article } from "../../../domain-entities/article";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import {ArticleRepository} from "../../repository/article-repository";
import {FilterCondition} from "../../filter-condition";

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
