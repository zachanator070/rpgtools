import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WORLD_PINS } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const UPDATE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation updatePin($pinId: ID!, $pageId: ID){
		updatePin(pinId: $pinId, pageId: $pageId){
			_id
			...currentWorldPins
		}
	}
`;

interface UpdatePinVariables {
	pinId: string;
	pageId: string;
}

interface UpdatePinResult extends GqlMutationResult<World, UpdatePinVariables>{
	updatePin: MutationMethod<World, UpdatePinVariables>;
}
export const useUpdatePin = ():UpdatePinResult => {
	const result = useGQLMutation<World, UpdatePinVariables>(UPDATE_PIN);
	return {
		...result,
		updatePin: result.mutate
	};
};
