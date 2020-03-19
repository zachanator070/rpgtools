import {useQuery} from "@apollo/react-hooks";
import {GET_WORLDS} from "../../../common/src/gql-queries";

export default (page) => {
	const {data, loading, error} = useQuery(GET_WORLDS, {variables: {page}});
	return {
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		worlds: data ? data.worlds : null
	}
};