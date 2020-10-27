import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WORLD_PINS } from "@rpgtools/common/src/gql-fragments";

export const DELETE_PIN = gql`
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export const useDeletePin = () => {
	const [deletePin, { loading, data, error }] = useMutation(DELETE_PIN);
	return {
		deletePin: async (pinId) => {
			return deletePin({ variables: { pinId } });
		},
		loading,
		pin: data ? data.deletePin : [],
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
