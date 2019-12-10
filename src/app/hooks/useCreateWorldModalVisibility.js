import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const CREATE_WORLD_MODAL_VISIBILITY = gql`
    query {
        createWorldModalVisibility @client
    }
`;

export default () => {

	const {data, loading, error} = useQuery(CREATE_WORLD_MODAL_VISIBILITY);
	return {
		createWorldModalVisibility: data ? data.createWorldModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}