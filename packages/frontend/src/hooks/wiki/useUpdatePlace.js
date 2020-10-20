import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {CURRENT_WIKI_PLACE_ATTRIBUTES} from "@rpgtools/common/src/gql-fragments";

export const UPDATE_PLACE = gql`
	mutation updatePlace($placeId: ID!, $mapImageId: ID, $pixelsPerFoot: Int){
		updatePlace(placeId: $placeId, mapImageId: $mapImageId, pixelsPerFoot: $pixelsPerFoot){
			_id
            ${CURRENT_WIKI_PLACE_ATTRIBUTES}
		}
	}
`;
export default () => {
	const [updatePlace, {data, loading, error}] = useMutation(UPDATE_PLACE);
	return {
		updatePlace: async (placeId, mapImageId, pixelsPerFoot) => {
			await updatePlace({variables: {placeId, mapImageId, pixelsPerFoot}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.updatePlace : null
	}
};