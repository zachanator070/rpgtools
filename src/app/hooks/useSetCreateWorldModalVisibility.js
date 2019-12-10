import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_CREATE_WORLD_MODAL_VISIBILITY = gql`
    mutation setCreateWorldModalVisibility($visibility: Boolean!){
        setCreateWorldModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setCreateWorldModalVisibility, {data, loading, error}] = useMutation(SET_CREATE_WORLD_MODAL_VISIBILITY);
	return {
		setCreateWorldModalVisibility: async (visibility) => {await setCreateWorldModalVisibility({variables: {visibility}})},
		visibility: data ? data : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};