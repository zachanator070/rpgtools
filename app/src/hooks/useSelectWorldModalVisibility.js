import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const SELECT_WORLD_MODAL_VISIBILITY = gql`
    query {
        selectWorldModalVisibility @client
    }
`;

export default () => {
	const {data, loading, error}  = useQuery(SELECT_WORLD_MODAL_VISIBILITY);
	return {
		selectWorldModalVisibility: data ? data.selectWorldModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}