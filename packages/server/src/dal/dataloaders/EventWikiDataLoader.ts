import {injectable} from "inversify";
import {GraphqlDataloader} from "../graphql-dataloader.js";
import {DatabaseContext} from "../database-context.js";
import {Repository} from "../repository/repository.js";
import {EventWiki} from "../../domain-entities/event-wiki.js";

@injectable()
export class EventWikiDataLoader extends GraphqlDataloader<EventWiki> {
    getRepository(databaseContext: DatabaseContext): Repository<EventWiki> {
        return databaseContext.eventRepository;
    }

}