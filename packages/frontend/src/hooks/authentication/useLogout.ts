import { useApolloClient } from "@apollo/client";
import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { LOGOUT_QUERY } from "@rpgtools/common/src/gql-mutations";

interface LogoutData {
	logout: boolean;
}

interface LogoutResult extends GqlMutationResult<boolean> {
	logout: MutationMethod<boolean, undefined>;
}

export default function useLogout(): LogoutResult {
	const client = useApolloClient();

	const result = useGQLMutation<boolean, LogoutData>(LOGOUT_QUERY, null, {
		update: {
			query: LOGOUT_QUERY,
			variablesUsed: null,
			update: () => {
				client.resetStore();
				return { logout: true };
			},
		},
	});

	return {
		...result,
		logout: result.mutate,
	};
}
