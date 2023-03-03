import {EventWiki} from "../../../domain-entities/event-wiki";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import {EventDocument, EventWikiModel} from "../models/event-wiki";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {inject} from "inversify";
import {EntityFactory} from "../../../types";
import mongoose from "mongoose";
import EventWikiRepository from "../../repository/event-wiki-repository";

export default class MongodbEventWikiRepository extends AbstractMongodbRepository<EventWiki, EventDocument> implements EventWikiRepository{
    @inject(INJECTABLE_TYPES.EventWikiFactory)
    entityFactory: EntityFactory<EventWiki, EventDocument, any>;

    model: mongoose.Model<any> = EventWikiModel;

    async findByCalendarId(calendarId: string): Promise<EventWiki[]> {
        return this.model.find({calendar: calendarId});
    }
}