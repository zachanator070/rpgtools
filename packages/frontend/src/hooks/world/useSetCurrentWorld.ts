import useCurrentUser from "../authentication/useCurrentUser";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {SET_CURRENT_WORLD} from "@rpgtools/common/src/gql-mutations";

interface SetCurrentWorldVariables {
	worldId: string;
}

interface SetCurrentWorldResult extends GqlMutationResult<World,  SetCurrentWorldVariables>{
	setCurrentWorld: MutationMethod<World, SetCurrentWorldVariables>;
}

export const useSetCurrentWorld = (): SetCurrentWorldResult => {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, SetCurrentWorldVariables>(SET_CURRENT_WORLD, {}, {
		onCompleted: async () => {
			await refetch();
		}
	});
	return {
		...result,
		setCurrentWorld: result.mutate
	};
};
