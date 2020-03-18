import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_PINS} from "./useCurrentWorld";

const DELETE_PIN = gql`
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			${CURRENT_WORLD_PINS}
		}
	}
`;

export const useDeletePin = () => {
	const [deletePin, {loading, data, error}] = useMutation(DELETE_PIN);
	return {
		deletePin: async (pinId) => {
			return deletePin({variables: {pinId}});
		},
		loading,
		pin: data ? data.deletePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};