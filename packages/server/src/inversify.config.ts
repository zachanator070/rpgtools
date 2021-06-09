import { Container } from "inversify";
import { ArticleRepository, EventPublisher } from "./types";
import { INJECTABLE_TYPES } from "./injectable-types";
import { MongodbArticleRepository } from "./dal/mongodb/repositories/mongodb-article-repository";
import { ApolloExpressEventPublisher } from "./apollo-express-event-publisher";

const container = new Container();
container.bind<ArticleRepository>(INJECTABLE_TYPES.ArticleRepository).to(MongodbArticleRepository);

container
	.bind<EventPublisher>(INJECTABLE_TYPES.EventPublisher)
	.to(ApolloExpressEventPublisher)
	.inSingletonScope();

export { container };
