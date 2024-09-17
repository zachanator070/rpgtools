import {useApolloClient} from "@apollo/client";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {LOGOUT_QUERY} from "@rpgtools/common/src/gql-mutations";

interface LogoutResult extends GqlMutationResult<boolean> {
	logout: MutationMethod<boolean, undefined>
}

export default function useLogout(): LogoutResult {
	const client = useApolloClient();

	const result = useGQLMutation<boolean>(LOGOUT_QUERY, {}, {
		update: async (cache, data) => {
			await client.resetStore();
		},
	})

	return {
		...result,
		logout: result.mutate
	};
};
