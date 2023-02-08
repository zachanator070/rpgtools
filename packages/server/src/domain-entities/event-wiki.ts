import {inject, injectable} from "inversify";
import {WikiPage} from "./wiki-page";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {Repository} from "../dal/repository/repository";
import {INJECTABLE_TYPES} from "../di/injectable-types";
import {EventDocument} from "../dal/mongodb/models/event-wiki";
import WikiPageModel from "../dal/sql/models/wiki-page-model";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy";

@injectable()
export class EventWiki extends WikiPage {
    type: string = EVENT_WIKI;

    age: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;

    @inject(INJECTABLE_TYPES.EventWikiFactory)
    factory: EntityFactory<EventWiki, EventDocument, WikiPageModel>;

    constructor(
        @inject(INJECTABLE_TYPES.EventWikiFactory)
            factory: EntityFactory<EventWiki, EventDocument, WikiPageModel>,
        @inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
            authorizationPolicy: WikiPageAuthorizationPolicy
    ) {
        super(authorizationPolicy);
        this.factory = factory;
    }

    getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
        return undefined;
    }

}