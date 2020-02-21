import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WIKI_ATTRIBUTES, CURRENT_WIKI_PLACE_ATTRIBUTES} from "./useCurrentWiki";

const UPDATE_PLACE = gql`
	mutation updatePlace($placeId: ID!, $mapImageId: ID){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId){
			_id
            ${CURRENT_WIKI_PLACE_ATTRIBUTES}
		}
	}
`;

export default () => {
	const [updatePlace, {data, loading, error}] = useMutation(UPDATE_PLACE);
	return {
		updatePlace: async (placeId, mapImageId) => {
			await updatePlace({variables: {placeId, mapImageId}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.updatePlace : null
	}
};