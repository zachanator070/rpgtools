import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const PIN_BEING_EDITED = gql`
	query {
		pinBeingEdited @client
	}
`;

export default () => {
	const { data, loading, error } = useQuery(PIN_BEING_EDITED);
	return {
		pinBeingEdited: data ? data.pinBeingEdited : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
