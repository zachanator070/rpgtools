import useCurrentWorld from "../world/useCurrentWorld";
import { useLazyQuery } from "@apollo/client";
import React, { useEffect } from "react";
import gql from "graphql-tag";
import { MODEL_ATTRIBUTES } from "../../../../common/src/gql-fragments";

export const GET_MODELS = gql`
	query getModels($worldId: ID!){
		models(worldId: $worldId){
			${MODEL_ATTRIBUTES}
		}
	}
`;
export const useGetModels = () => {
	const { currentWorld, loading } = useCurrentWorld();
	const [getModels, { data, loading: modelLoading, error, refetch }] = useLazyQuery(GET_MODELS);

	useEffect(() => {
		(async () => {
			if (currentWorld) {
				await getModels({ variables: { worldId: currentWorld._id } });
			}
		})();
	}, [currentWorld]);

	return {
		loading: loading || modelLoading,
		models: data ? data.models : null,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
