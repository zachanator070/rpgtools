import {FetchResult, useApolloClient} from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, useGQLMutation} from "../useGQLMutation";

export const LOGOUT_QUERY = gql`
	mutation logout{
		logout
	}
`;

interface LogoutResult extends GqlMutationResult<boolean> {
	logout: () => Promise<FetchResult<boolean>>
}

export default (): LogoutResult => {
	const client = useApolloClient();

	const result = useGQLMutation<boolean>(LOGOUT_QUERY, null, {
		update: async (cache, data) => {
			// cache.writeQuery({query: LOGIN_QUERY, data: {currentUser: null}});
			await client.resetStore();
		},
	})

	return {
		...result,
		logout: result.mutate
	};
};
