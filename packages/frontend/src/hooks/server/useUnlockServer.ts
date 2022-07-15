import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {UNLOCK_SERVER} from "@rpgtools/common/src/gql-mutations";

interface UnlockServerVariables {
	unlockCode: string;
	email: string;
	username: string;
	password: string;
}

interface UnlockServerResult extends GqlMutationResult<boolean, UnlockServerVariables>{
	unlockServer: MutationMethod<boolean, UnlockServerVariables>
}

export default function useUnlockServer(callback?: (data: boolean) => Promise<void>): UnlockServerResult {
	const result = useGQLMutation<boolean, UnlockServerVariables>(
		UNLOCK_SERVER,
		{},
		{
			onCompleted: callback
		}
	);

	return {
		...result,
		unlockServer: result.mutate
	};
};
