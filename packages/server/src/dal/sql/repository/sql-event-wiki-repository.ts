import AbstractSqlRepository from "./abstract-sql-repository";
import {EventWiki} from "../../../domain-entities/event-wiki";
import EventWikiModel from "../models/event- wiki-model";
import {ModelStatic} from "sequelize";
import {EntityFactory} from "../../../types";
import {inject, injectable} from "inversify";
import {INJECTABLE_TYPES} from "../../../di/injectable-types";

@injectable()
export default class SqlEventWikiRepository extends AbstractSqlRepository<EventWiki, EventWikiModel> {

    @inject(INJECTABLE_TYPES.EventWikiFactory)
    entityFactory: EntityFactory<EventWiki, any, EventWikiModel>;

    async modelFactory(entity: EventWiki | undefined): Promise<EventWikiModel> {
        return EventWikiModel.build({
            _id: entity._id,
            name: entity.name,
            contentId: entity.contentId,
            worldId: entity.world,
            type: entity.type,
            coverImageId: entity.coverImage,
            age: entity.age,
            year: entity.year,
            month: entity.month,
            day: entity.day,
            hour: entity.hour,
            minute: entity.minute,
            second: entity.second
        });
    }

    staticModel: ModelStatic<any> = EventWikiModel;

}