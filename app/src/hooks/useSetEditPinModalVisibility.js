import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_EDIT_PIN_MODAL_VISIBILITY = gql`
    mutation setEditPinModalVisibility($visibility: Boolean!){
        setEditPinModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setEditPinModalVisibility, {data, loading, error}] = useMutation(SET_EDIT_PIN_MODAL_VISIBILITY);
	return {
		setEditPinModalVisibility: async (visibility) => {await setEditPinModalVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};