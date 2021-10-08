import gql from "graphql-tag";
import { CURRENT_WORLD_PINS } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const DELETE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation deletePin($pinId: ID!){
		deletePin(pinId: $pinId){
			_id
			...currentWorldPins
		}
	}
`;
interface DeletePinVariables {
	pinId: string;
}

interface DeletePinResult extends GqlMutationResult<World, DeletePinVariables>{
	deletePin: MutationMethod<World, DeletePinVariables>
}
export const useDeletePin = (): DeletePinResult => {
	const result = useGQLMutation<World, DeletePinVariables>(DELETE_PIN);
	return {
		...result,
		deletePin: result.mutate
	};
};
