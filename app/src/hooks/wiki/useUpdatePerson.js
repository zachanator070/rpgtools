import {useMutation} from "@apollo/client";
import {UPDATE_PERSON} from "../../../../common/src/gql-queries";

export default () => {
	const [updatePerson, {data, loading, error}] = useMutation(UPDATE_PERSON);
	return {
		updatePerson: async (personId, name, content, coverImageId) => {
			await updatePerson({variables: {personId, name, content, coverImageId}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		person: data ? data.updatePerson : null
	}
};