import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const PERMISSION_MODAL_VISIBILITY = gql`
    query {
        permissionModalVisibility @client
    }
`;

export default () => {

	const {data, loading, error} = useQuery(PERMISSION_MODAL_VISIBILITY);
	return {
		permissionModalVisibility: data ? data.permissionModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}