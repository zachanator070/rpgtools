import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_SELECT_WORLD_MODAL_VISIBILITY = gql`
    mutation setSelectWorldModalVisibility($visibility: Boolean!){
        setSelectWorldModalVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setSelectWorldModalVisibility, {data, loading, error}] = useMutation(SET_SELECT_WORLD_MODAL_VISIBILITY);
	return {
		setSelectWorldModalVisibility: async (visibility) => {await setSelectWorldModalVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};