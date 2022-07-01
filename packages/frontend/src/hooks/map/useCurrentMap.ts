import {useParams} from "react-router-dom";
import {Place} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {GET_CURRENT_MAP} from "@rpgtools/common/src/gql-queries";

interface CurrentMapVariables {
	wikiId: string;
}

interface CurrentMapResult extends GqlQueryResult<Place, CurrentMapVariables>{
	currentMap: Place
}

export default (): CurrentMapResult => {
	const { map_id } = useParams();
	const result = useGQLQuery<Place, CurrentMapVariables>(GET_CURRENT_MAP, {wikiId: map_id});
	return {
		...result,
		currentMap: result.data
	}
};
