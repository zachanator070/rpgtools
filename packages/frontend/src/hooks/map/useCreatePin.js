import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {CURRENT_WORLD_PINS} from "../../../../common/src/gql-fragments";

export const CREATE_PIN = gql`
	mutation createPin($mapId: ID!, $x: Float!, $y: Float!, $wikiId: ID){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export default () => {
	const [createPin, {data, loading, error}] = useMutation(CREATE_PIN);
	return {
		createPin: async (mapId, x, y, wikiId) => {
			return await createPin({variables: {mapId, x, y, wikiId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};