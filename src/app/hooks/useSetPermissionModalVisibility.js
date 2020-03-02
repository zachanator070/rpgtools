import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_PERMISSION_MODAL_VISIBILITY = gql`
    mutation setPermissionModalVisibility($visibility: Boolean!){
        setPermissionModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setPermissionModalVisibility, {data, loading, error}] = useMutation(SET_PERMISSION_MODAL_VISIBILITY);
	return {
		setPermissionModalVisibility: async (visibility) => {await setPermissionModalVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};