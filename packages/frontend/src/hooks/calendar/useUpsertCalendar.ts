import useCurrentWorld from "../world/useCurrentWorld.js";
import {Age, Calendar} from "../../types.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {UPSERT_CALENDAR} from "@rpgtools/common/src/gql-mutations.js";
import {GET_CALENDARS} from "@rpgtools/common/src/gql-queries.js";

export interface UpsertCalendarVariables {
    calendarId?: string;
    name: string;
    ages: Age[]
}

export interface UpsertCalendarResult extends GqlMutationResult<Calendar, UpsertCalendarVariables> {
    upsertCalendar: MutationMethod<Calendar, UpsertCalendarVariables>;
}

export default function (): UpsertCalendarResult {
    const {currentWorld} = useCurrentWorld();
    const result = useGQLMutation<Calendar, UpsertCalendarVariables>(UPSERT_CALENDAR, {world: currentWorld._id}, {refetchQueries: [GET_CALENDARS]});
    return {
        ...result,
        upsertCalendar: result.mutate
    };
}