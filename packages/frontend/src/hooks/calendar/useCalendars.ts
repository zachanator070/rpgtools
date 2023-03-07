import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {Calendar} from "../../types";
import {GET_CALENDARS} from "@rpgtools/common/src/gql-queries";
import useCurrentWorld from "../world/useCurrentWorld";


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