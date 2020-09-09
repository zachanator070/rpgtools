import {useMutation} from "@apollo/client";
import {UPDATE_PIN} from "../../../common/src/gql-queries";

export const useUpdatePin = () => {
	const [updatePin, {loading, data, error}] = useMutation(UPDATE_PIN);
	return {
		updatePin: async (pinId, pageId) => {
			return updatePin({variables: {pinId, pageId}});
		},
		loading,
		pin: data ? data.updatePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};