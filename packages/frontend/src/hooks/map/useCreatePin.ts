import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {CREATE_PIN} from "@rpgtools/common/src/gql-mutations";

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
