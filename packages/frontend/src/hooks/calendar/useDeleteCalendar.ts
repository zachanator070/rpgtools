import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { DELETE_CALENDAR } from "@rpgtools/common/src/gql-mutations";
import { Calendar } from "../../types";
import { GET_CALENDARS } from "@rpgtools/common/src/gql-queries";

export interface DeleteCalendarVariables {
	calendarId: string;
}

interface DeleteCalendarData {
	deleteCalendar: Calendar;
}

export interface DeleteCalendarResult extends GqlMutationResult<Calendar, DeleteCalendarVariables> {
	deleteCalendar: MutationMethod<Calendar, DeleteCalendarVariables>;
}

export default function (): DeleteCalendarResult {
	const result = useGQLMutation<Calendar, DeleteCalendarData, DeleteCalendarVariables>(
		DELETE_CALENDAR,
		null,
		{ refetchQueries: [GET_CALENDARS] },
	);
	return {
		...result,
		deleteCalendar: result.mutate,
	};
}
