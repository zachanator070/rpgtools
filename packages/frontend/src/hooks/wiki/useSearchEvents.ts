import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {EventWikiPaginatedResult} from "../../types.js";
import {SEARCH_EVENTS} from "@rpgtools/common/src/gql-queries.js";
import {useParams} from "react-router-dom";
import useFetchAllPagesEffect from "../useFetchAllPagesEffect.js";

interface SearchEventsVariables {
    calendarIds?: string[],
    relatedWikiIds?: string[],
    page?: number
}

interface SearchEventsResult extends GqlQueryResult<EventWikiPaginatedResult, SearchEventsVariables>{
    events: EventWikiPaginatedResult;
}

export default function useSearchEvents(variables: SearchEventsVariables) : SearchEventsResult {
    const {world_id} = useParams();
    if (!variables.page) {
        variables.page = 1;
    }
    const result = useGQLQuery<EventWikiPaginatedResult, SearchEventsVariables>(SEARCH_EVENTS, {worldId: world_id, ...variables});
    useFetchAllPagesEffect(result, SEARCH_EVENTS, {worldId: world_id, ...variables});
    return {
        ...result,
        events: result.data
    };
}