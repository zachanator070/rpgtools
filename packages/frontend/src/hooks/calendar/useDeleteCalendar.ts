import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {DELETE_CALENDAR} from "@rpgtools/common/src/gql-mutations";
import {Calendar} from "../../types";
import {GET_CALENDARS} from "@rpgtools/common/src/gql-queries";

export interface DeleteCalendarVariables {
    calendarId: string;
}

export interface DeleteCalendarResult extends GqlMutationResult<Calendar, DeleteCalendarVariables> {
    deleteCalendar: MutationMethod<Calendar, DeleteCalendarVariables>
}

export default function (): DeleteCalendarResult {
    const result = useGQLMutation<Calendar, DeleteCalendarVariables>(DELETE_CALENDAR, {}, {refetchQueries: [GET_CALENDARS]});
    return {
        ...result,
        deleteCalendar: result.mutate
    }
}