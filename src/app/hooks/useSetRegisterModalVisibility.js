import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_REGISTER_MODAL_VISIBILITY = gql`
    mutation setRegisterModalVisibility($visibility: Boolean!){
        setRegisterModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setRegisterModalVisibility, {data, loading, error}] = useMutation(SET_REGISTER_MODAL_VISIBILITY);
	return {
		setRegisterModalVisibility: async (visibility) => {await setRegisterModalVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};