import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {Calendar} from "../../types.js";
import {GET_CALENDARS} from "@rpgtools/common/src/gql-queries.js";
import useCurrentWorld from "../world/useCurrentWorld.js";


interface CalendarsResult extends GqlQueryResult<Calendar[]> {
    calendars: Calendar[];
}

export default function (): CalendarsResult {
    const {currentWorld} = useCurrentWorld();
    const result = useGQLQuery<Calendar[], void>(GET_CALENDARS, {worldId: currentWorld._id});
    return {
        ...result,
        calendars: result.data
    };
}