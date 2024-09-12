import {inject, injectable} from "inversify";
import {WikiPage} from "./wiki-page.js";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import {DomainEntity, EntityFactory, RepositoryAccessor} from "../types";
import {Repository} from "../dal/repository/repository.js";
import {INJECTABLE_TYPES} from "../di/injectable-types.js";
import WikiPageModel from "../dal/sql/models/wiki-page-model.js";
import {WikiPageAuthorizationPolicy} from "../security/policy/wiki-page-authorization-policy.js";

@injectable()
export class EventWiki extends WikiPage {
    type: string = EVENT_WIKI;

    calendar: string;

    age: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;

    @inject(INJECTABLE_TYPES.EventWikiFactory)
    factory: EntityFactory<EventWiki, WikiPageModel>;

    constructor(
        @inject(INJECTABLE_TYPES.EventWikiFactory)
            factory: EntityFactory<EventWiki, WikiPageModel>,
        @inject(INJECTABLE_TYPES.WikiPageAuthorizationPolicy)
            authorizationPolicy: WikiPageAuthorizationPolicy
    ) {
        super(authorizationPolicy);
        this.factory = factory;
    }

    getRepository(accessor: RepositoryAccessor): Repository<DomainEntity> {
        return accessor.eventRepository;
    }

}