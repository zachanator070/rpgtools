import {useLazyQuery} from "@apollo/react-hooks";
import useCurrentWorld from "./useCurrentWorld";
import {SEARCH_ROLES} from "../../../common/src/gql-queries";

export const useSearchRoles = () => {
	const [searchRoles, {data, loading, error}] = useLazyQuery(SEARCH_ROLES);
	const {currentWorld} = useCurrentWorld();
	return {
		searchRoles: async (name) => {return searchRoles({variables: {worldId: currentWorld._id, name}});},
		roles: data ? data.roles.docs : [],
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};