import useCurrentWorld from "../world/useCurrentWorld";
import {GET_MODELS} from "../../../../common/src/gql-queries";
import {useLazyQuery} from "@apollo/client";
import React, {useEffect} from "react";

export const useGetModels = () => {

	const {currentWorld, loading} = useCurrentWorld();
	const [getModels, {data, loading: modelLoading, error, refetch}] = useLazyQuery(GET_MODELS);

	useEffect(() => {
		(async () => {
			if(currentWorld){
				await getModels({variables: {worldId: currentWorld._id}});
			}
		})();
	}, [currentWorld]);

	return {
		loading: (loading || modelLoading),
		models: data ? data.models : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	}

};