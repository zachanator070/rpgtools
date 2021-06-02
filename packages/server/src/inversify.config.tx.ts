import { Container } from "inversify";
import { ArticleRepository } from "./types";
import { INJECTABLE_TYPES } from "./injectable-types";
import { MongodbArticleRepository } from "./dal/mongodb/repositories/mongodb-article-repository";

const myContainer = new Container();
myContainer
	.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository)
	.to(MongodbArticleRepository);

export { myContainer };
