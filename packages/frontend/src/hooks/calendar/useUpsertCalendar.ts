import useCurrentWorld from "../world/useCurrentWorld";
import { Age, Calendar } from "../../types";
import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { UPSERT_CALENDAR } from "@rpgtools/common/src/gql-mutations";
import { GET_CALENDARS } from "@rpgtools/common/src/gql-queries";

export interface UpsertCalendarVariables {
	world: string;
	name?: string;
	ages?: Age[];
}

interface UpsertCalendarData {
	upsertCalendar: Calendar;
}

export interface UpsertCalendarResult extends GqlMutationResult<Calendar, UpsertCalendarVariables> {
	upsertCalendar: MutationMethod<Calendar, UpsertCalendarVariables>;
}

export default function (): UpsertCalendarResult {
	const { currentWorld } = useCurrentWorld();
	const result = useGQLMutation<Calendar, UpsertCalendarData, UpsertCalendarVariables>(
		UPSERT_CALENDAR,
		{ world: currentWorld._id },
		{ refetchQueries: [GET_CALENDARS] },
	);
	return {
		...result,
		upsertCalendar: result.mutate,
	};
}
