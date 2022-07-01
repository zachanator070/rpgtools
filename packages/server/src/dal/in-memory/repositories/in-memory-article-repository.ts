import { Article } from "../../../domain-entities/article";
import { injectable } from "inversify";
import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import { ArticleRepository } from "../../../types";

@injectable()
export class InMemoryArticleRepository
	extends AbstractInMemoryRepository<Article>
	implements ArticleRepository {}
