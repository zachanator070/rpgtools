import gql from "graphql-tag";
import { CURRENT_WORLD_PINS } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const CREATE_PIN = gql`
	${CURRENT_WORLD_PINS}
	mutation createPin($mapId: ID!, $x: Float!, $y: Float!, $wikiId: ID){
		createPin(mapId: $mapId, x: $x, y: $y, wikiId: $wikiId){
			_id
			...currentWorldPins	
		}
	}
`;

interface CreatePinVariables {
	mapId: string;
	x: number;
	y: number;
	wikiId?: number;
}

interface CreatePinResult extends GqlMutationResult<World, CreatePinVariables>{
	createPin: MutationMethod<World, CreatePinVariables>;
}

export default (): CreatePinResult => {
	const result = useGQLMutation<World, CreatePinVariables>(CREATE_PIN);
	return {
		...result,
		createPin: result.mutate
	};
};
