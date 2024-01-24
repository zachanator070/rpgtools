import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Pin } from "../../types";
import { CREATE_PIN } from "@rpgtools/common/src/gql-mutations";
import { GET_PINS } from "@rpgtools/common/src/gql-queries";

interface CreatePinVariables {
	mapId: string;
	x: number;
	y: number;
	wikiId?: number;
}

interface CreatePinData {
	createPin: Pin;
}
interface CreatePinResult extends GqlMutationResult<Pin, CreatePinVariables> {
	createPin: MutationMethod<Pin, CreatePinVariables>;
}

export default function useCreatePin(): CreatePinResult {
	const result = useGQLMutation<Pin, CreatePinData, CreatePinVariables>(
		CREATE_PIN,
		{},
		{ refetchQueries: [GET_PINS] },
	);
	return {
		...result,
		createPin: result.mutate,
	};
}
