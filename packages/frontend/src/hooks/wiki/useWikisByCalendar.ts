import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {EventWiki, WikiPagePaginatedResult} from "../../types";
import {SEARCH_WIKIS, WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";
import {useParams} from "react-router-dom";
import {EVENT_WIKI} from "@rpgtools/common/src/type-constants";
import {useEffect} from "react";

interface WikisByCalendarVariables {
    worldId: string;
    types?: string[];
    page: number;
}

interface WikisByCalendarResult extends GqlQueryResult<WikiPagePaginatedResult, WikisByCalendarVariables>{
    wikis: WikiPagePaginatedResult;
}

export default function useWikisByCalendar({calendarId}: {calendarId: string}): WikisByCalendarResult {
    const {world_id} = useParams();
    const variables = {worldId: world_id, types: [EVENT_WIKI]};
    let result = useGQLQuery<WikiPagePaginatedResult, WikisByCalendarVariables>(SEARCH_WIKIS, variables);

    useEffect(() => {
        if (result.data && result.data.nextPage) {
            (async () => {
                const more = await result.fetchMore(
                    {
                        variables: {
                            ...variables,
                            page: result.data.nextPage,
                        },
                        updateQuery: (previousResultQuery: WikisByCalendarResult, options: {fetchMoreResult: WikisByCalendarResult}) => {
                            const newResult = {
                                wikisInFolder: {
                                    docs: [],
                                    nextPage: options.fetchMoreResult.wikis.nextPage
                                }
                            };
                            newResult.wikisInFolder.docs.push(...previousResultQuery.wikis.docs);
                            newResult.wikisInFolder.docs.push(...options.fetchMoreResult.wikis.docs);
                            return newResult;
                        }
                    },
                );
            })();
        }
    }, [result.data]);
    if(result.data) {
        result = {
            ...result,
            data: {
                ...result.data,
                docs: result.data.docs.filter((wiki: EventWiki) => wiki.calendar._id === calendarId)
            }
        }
    }
    return {
        ...result,
        wikis: result.data,
    };
}