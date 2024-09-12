import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Pin, World} from "../../types.js";
import {CREATE_PIN} from "@rpgtools/common/src/gql-mutations";
import {GET_PINS} from "@rpgtools/common/src/gql-queries";

interface CreatePinVariables {
	mapId: string;
	x: number;
	y: number;
	wikiId?: number;
}

interface CreatePinResult extends GqlMutationResult<Pin, CreatePinVariables>{
	createPin: MutationMethod<Pin, CreatePinVariables>;
}

export default function useCreatePin(): CreatePinResult {
	const result = useGQLMutation<Pin, CreatePinVariables>(CREATE_PIN, {}, {refetchQueries: [GET_PINS]});
	return {
		...result,
		createPin: result.mutate
	};
};
