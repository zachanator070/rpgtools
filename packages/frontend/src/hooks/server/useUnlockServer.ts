import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {UNLOCK_SERVER} from "@rpgtools/common/src/gql-mutations";
import {GET_SERVER_CONFIG} from "@rpgtools/common/src/gql-queries";

interface UnlockServerVariables {
	unlockCode: string;
	email: string;
	username: string;
	password: string;
}

interface UnlockServerResult extends GqlMutationResult<boolean, UnlockServerVariables>{
	unlockServer: MutationMethod<boolean, UnlockServerVariables>
}

export default function useUnlockServer(callback?: (data: any) => Promise<void>): UnlockServerResult {
	const result = useGQLMutation<boolean, UnlockServerVariables>(
		UNLOCK_SERVER,
		{},
		{
			onQueryUpdated: callback,
		}
	);

	return {
		...result,
		unlockServer: result.mutate
	};
};
