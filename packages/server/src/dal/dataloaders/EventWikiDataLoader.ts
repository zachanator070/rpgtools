import {injectable} from "inversify";
import {GraphqlDataloader} from "../graphql-dataloader";
import {DatabaseContext} from "../database-context";
import {Repository} from "../repository/repository";
import {EventWiki} from "../../domain-entities/event-wiki";

@injectable()
export class EventWikiDataLoader extends GraphqlDataloader<EventWiki> {
    getRepository(databaseContext: DatabaseContext): Repository<EventWiki> {
        return databaseContext.eventRepository;
    }

}