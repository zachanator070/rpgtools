import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_PIN_BEING_EDITED = gql`
    mutation setPinBeingEdited($pinId: ID!){
        setPinBeingEdited(pinId: $pinId) @client
    }
`;

export default () => {
	const [setPinBeingEdited, {data, loading, error}] = useMutation(SET_PIN_BEING_EDITED);
	return {
		setPinBeingEdited: async (pinId) => {await setPinBeingEdited({variables: {pinId}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
};