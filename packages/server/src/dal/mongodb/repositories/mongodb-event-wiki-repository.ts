import {EventWiki} from "../../../domain-entities/event-wiki";
import {AbstractMongodbRepository} from "./abstract-mongodb-repository";
import {EventDocument, EventWikiModel} from "../models/event-wiki";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";
import {inject} from "inversify";
import {EntityFactory} from "../../../types";
import mongoose from "mongoose";

export default class MongodbEventWikiRepository extends AbstractMongodbRepository<EventWiki, EventDocument> {
    @inject(INJECTABLE_TYPES.EventWikiFactory)
    entityFactory: EntityFactory<EventWiki, EventDocument, any>;

    model: mongoose.Model<any> = EventWikiModel;
}