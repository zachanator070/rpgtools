import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const LOGIN_MODAL_VISIBILITY = gql`
    query {
        loginModalVisibility @client
    }
`;

export default () => {
	const {data, loading, error} = useQuery(LOGIN_MODAL_VISIBILITY);
	return {
		loginModalVisibility: data ? data.loginModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}