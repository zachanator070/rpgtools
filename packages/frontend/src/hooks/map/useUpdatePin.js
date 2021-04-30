import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WORLD_PINS } from "../../../../common/src/gql-fragments";

export const UPDATE_PIN = gql`
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;
export const useUpdatePin = () => {
	const [updatePin, { loading, data, error }] = useMutation(UPDATE_PIN);
	return {
		updatePin: async (pinId, pageId) => {
			return updatePin({ variables: { pinId, pageId } });
		},
		loading,
		pin: data ? data.updatePin : [],
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
