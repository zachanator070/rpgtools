import {useQuery} from "@apollo/react-hooks";
import {GET_CURRENT_USER} from "../../../common/src/gql-queries";

export default () => {
	const {data: currentUserData, loading, error, refetch} = useQuery(GET_CURRENT_USER);
	return {
		currentUser: currentUserData ? currentUserData.currentUser : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	}
}