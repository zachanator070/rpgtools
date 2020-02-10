import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const UPDATE_PLACE = gql`
	mutation updatePlace($placeId: ID!, $name: String, $content: String, $coverImageId: ID, $mapImageId: ID){
		updatePlace(placeId: $placeId, name: $name, content: $content, coverImageId: $coverImageId, mapImageId: $mapImageId){
			_id
		}
	}
`;

export default () => {
	const [updatePlace, {data, loading, error}] = useMutation(UPDATE_PLACE);
	return {
		updatePlace: async (placeId, name, content, coverImageId, mapImageId) => {
			await updatePlace({variables: {placeId, name, content, coverImageId, mapImageId}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.updatePlace : null
	}
};