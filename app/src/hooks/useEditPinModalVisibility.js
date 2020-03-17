import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const EDIT_PIN_MODAL_VISIBILITY = gql`
    query {
        editPinModalVisibility @client
    }
`;

export default () => {
	const {data, loading, error}  = useQuery(EDIT_PIN_MODAL_VISIBILITY);
	return {
		editPinModalVisibility: data ? data.editPinModalVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}