import useCurrentWorld from "../world/useCurrentWorld";
import { useEffect } from "react";
import { Model } from "../../types";
import useGQLLazyQuery, { GqlLazyHookResult } from "../useGQLLazyQuery";
import { GET_MODELS } from "@rpgtools/common/src/gql-queries";

interface GetModelsVariables {
	worldId?: string;
}

interface GetModelsData {
	models: Model[];
}

interface GetModelsResult extends GetModelsData, GqlLazyHookResult<Model[], GetModelsVariables> {}

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
		models: result.data || [],
	};
}
