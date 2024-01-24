import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { UPDATE_PIN } from "@rpgtools/common/src/gql-mutations";
import { GET_PINS } from "@rpgtools/common/src/gql-queries";

interface UpdatePinVariables {
	pinId: string;
	pageId: string;
}

interface UpdatePinData {
	updatePin: World;
}
interface UpdatePinResult extends GqlMutationResult<World, UpdatePinVariables> {
	updatePin: MutationMethod<World, UpdatePinVariables>;
}
export default function useUpdatePin(): UpdatePinResult {
	const result = useGQLMutation<World, UpdatePinData, UpdatePinVariables>(UPDATE_PIN, null, {
		refetchQueries: [GET_PINS],
	});
	return {
		...result,
		updatePin: result.mutate,
	};
}
