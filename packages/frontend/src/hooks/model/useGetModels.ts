import useCurrentWorld from "../world/useCurrentWorld.js";
import {useEffect} from "react";
import {Model} from "../../types.js";
import useGQLLazyQuery, {GqlLazyHookResult} from "../useGQLLazyQuery.js";
import {GET_MODELS} from "@rpgtools/common/src/gql-queries";

interface GetModelsVariables {
	worldId?: string;
}

interface GetModelsResult extends GqlLazyHookResult<Model[], GetModelsVariables> {
	models: Model[];
}

export default function useGetModels(): GetModelsResult {
	const { currentWorld } = useCurrentWorld();
	const result = useGQLLazyQuery<Model[], GetModelsVariables>(GET_MODELS);

	useEffect(() => {
		(async () => {
			if (currentWorld) {
				await result.fetch({ worldId: currentWorld._id });
			}
		})();
	}, [currentWorld]);

	return {
		...result,
		models: result.data || []
	};
};
