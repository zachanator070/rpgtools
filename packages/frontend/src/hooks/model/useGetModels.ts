import useCurrentWorld from "../world/useCurrentWorld";
import {useEffect} from "react";
import {Model} from "../../types";
import {GqlLazyHookResult, useGQLLazyQuery} from "../useGQLLazyQuery";
import {GET_MODELS} from "@rpgtools/common/src/gql-queries";

interface GetModelsVariables {
	worldId?: string;
}

interface GetModelsResult extends GqlLazyHookResult<Model[], GetModelsVariables> {
	models: Model[];
}

export const useGetModels = (): GetModelsResult => {
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
		models: result.data
	};
};
