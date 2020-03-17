import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const REGISTER_MODAL_VISIBILITY = gql`
    query {
        registerModalVisibility @client
    }
`;

export default () => {
	const {data, loading, error}  = useQuery(REGISTER_MODAL_VISIBILITY);
	return {
		registerModalVisibility: data ? data.registerModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}