import {useParams} from "react-router-dom";
import {Place} from "../../types";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {GET_CURRENT_MAP} from "@rpgtools/common/src/gql-queries";

interface CurrentMapVariables {
	wikiId: string;
}

interface CurrentMapResult extends GqlQueryResult<Place, CurrentMapVariables>{
	currentMap: Place
}

export default function useCurrentMap(): CurrentMapResult {
	const { map_id } = useParams();
	const result = useGQLQuery<Place, CurrentMapVariables>(GET_CURRENT_MAP, {wikiId: map_id});
	return {
		...result,
		currentMap: result.data
	}
};
