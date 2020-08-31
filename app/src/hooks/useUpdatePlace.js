import {useMutation} from "@apollo/react-hooks";
import {UPDATE_PLACE} from "../../../common/src/gql-queries";

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