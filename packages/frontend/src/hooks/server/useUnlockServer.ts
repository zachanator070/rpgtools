import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { UNLOCK_SERVER } from "@rpgtools/common/src/gql-mutations";

interface UnlockServerVariables {
	unlockCode: string;
	email: string;
	username: string;
	password: string;
}

interface UnlockServerData {
	unlockServer: boolean;
}
interface UnlockServerResult extends GqlMutationResult<boolean, UnlockServerVariables> {
	unlockServer: MutationMethod<boolean, UnlockServerVariables>;
}

export default function useUnlockServer(): UnlockServerResult {
	const result = useGQLMutation<boolean, UnlockServerData, UnlockServerVariables>(
		UNLOCK_SERVER,
		{},
	);

	return {
		...result,
		unlockServer: result.mutate,
	};
}
