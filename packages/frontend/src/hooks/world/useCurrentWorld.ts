import {useParams} from "react-router-dom";
import {World} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_CURRENT_WORLD} from "@rpgtools/common/src/gql-queries";

interface CurrentWorldVariables {
	worldId: string;
}

interface CurrentWorldResult extends GqlQueryResult<World, CurrentWorldVariables>{
	currentWorld: World;
}

export default function useCurrentWorld(): CurrentWorldResult {
	const { world_id } = useParams();
	const result = useGQLQuery<World, CurrentWorldVariables>(GET_CURRENT_WORLD, {worldId: world_id});
	return {
		...result,
		currentWorld: result.data
	};
};
