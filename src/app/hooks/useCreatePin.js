import gql from 'graphql-tag';
import {useMutation, useQuery} from "@apollo/react-hooks";

const CREATE_PIN = gql`
	mutation createPin($mapId: ID!, $x: Int!, $y: Int!, $wikiId: ID!){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			map {
				_id
			}
			x
			y
			page {
				_id
			}
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