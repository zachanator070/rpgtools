import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_LOGIN_MODAL_VISIBILITY = gql`
    mutation setLoginModalVisibility($visibility: Boolean!){
        setLoginModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setLoginModalVisibility, {data, loading, error}] = useMutation(SET_LOGIN_MODAL_VISIBILITY);
	return {
		setLoginModalVisibility: async (visibility) => {await setLoginModalVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};