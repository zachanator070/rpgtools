import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { Calendar } from "../../types";
import { GET_CALENDARS } from "@rpgtools/common/src/gql-queries";
import useCurrentWorld from "../world/useCurrentWorld";

interface CalendarsQueryVariables {
	worldId: string;
}

interface CalendarsData {
	calendars: Calendar[];
}

interface CalendarsResult
	extends CalendarsData,
		GqlQueryResult<Calendar[], CalendarsData, CalendarsQueryVariables> {}

export default function (): CalendarsResult {
	const { currentWorld } = useCurrentWorld();
	const result = useGQLQuery<Calendar[], CalendarsResult, CalendarsQueryVariables>(GET_CALENDARS, {
		worldId: currentWorld._id,
	});
	return {
		...result,
		calendars: result.data,
	};
}
