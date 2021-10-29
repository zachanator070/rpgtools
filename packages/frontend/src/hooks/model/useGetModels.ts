import useCurrentWorld from "../world/useCurrentWorld";
import React, { useEffect } from "react";
import gql from "graphql-tag";
import { MODEL_ATTRIBUTES } from "../gql-fragments";
import {Model} from "../../types";
import {GqlQueryResult} from "../useGQLQuery";
import {useGQLLazyQuery} from "../useGQLLazyQuery";

export const GET_MODELS = gql`
	${MODEL_ATTRIBUTES}
	query getModels($worldId: ID!){
		models(worldId: $worldId){
			...modelAttributes
		}
	}
`;

interface GetModelsVariables {
	worldId: string;
}

interface GetModelsResult extends GqlQueryResult<Model[], GetModelsVariables> {
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
