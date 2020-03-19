import {useMutation} from "@apollo/react-hooks";
import {DELETE_PIN} from "../../../common/src/gql-queries";

export const useDeletePin = () => {
	const [deletePin, {loading, data, error}] = useMutation(DELETE_PIN);
	return {
		deletePin: async (pinId) => {
			return deletePin({variables: {pinId}});
		},
		loading,
		pin: data ? data.deletePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};