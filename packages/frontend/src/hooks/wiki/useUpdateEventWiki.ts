import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {EventWiki} from "../../types.js";
import {UPDATE_EVENT} from "@rpgtools/common/src/gql-mutations.js";
import {GET_WIKI} from "@rpgtools/common/src/gql-queries.js";

interface UpdateEventWikiVariables {
    wikiId: string,
    calendarId: string,
    age: number,
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number
}

interface UpdateEventWikiResult {
    updateEventWiki: MutationMethod<EventWiki, UpdateEventWikiVariables>;
}

export default function useUpdateEventWiki(): UpdateEventWikiResult {
    const result = useGQLMutation<EventWiki, UpdateEventWikiVariables>(UPDATE_EVENT, null, {
        refetchQueries: [GET_WIKI]
    });
    return {
        ...result,
        updateEventWiki: result.mutate
    };
}