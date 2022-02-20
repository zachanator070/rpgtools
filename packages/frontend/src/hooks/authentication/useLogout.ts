import {FetchResult, useApolloClient} from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";

export const LOGOUT_QUERY = gql`
	mutation logout{
		logout
	}
`;

interface LogoutResult extends GqlMutationResult<boolean> {
	logout: MutationMethod<boolean, undefined>
}

export default (): LogoutResult => {
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
