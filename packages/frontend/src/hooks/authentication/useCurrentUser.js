import { useQuery } from "@apollo/client";
import { GET_CURRENT_USER } from "../../../../common/src/queries";

export default () => {
	const { data: currentUserData, loading, error, refetch } = useQuery(GET_CURRENT_USER);
	return {
		currentUser: currentUserData ? currentUserData.currentUser : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
