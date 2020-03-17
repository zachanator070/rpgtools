import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const UPDATE_PERSON = gql`
	mutation updatePerson($personId: ID!, $name: String, $content: String, $coverImageId: ID){
		updatePerson(personId: $personId, name: $name, content: $content, coverImageId: $coverImageId){
			_id
		}
	}
`;

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