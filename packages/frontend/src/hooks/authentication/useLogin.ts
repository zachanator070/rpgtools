import { useApolloClient } from "@apollo/client";
import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { User } from "../../types";
import { LOGIN_QUERY } from "@rpgtools/common/src/gql-mutations";

interface LoginVariables {
	username: string;
	password: string;
}

interface LoginData {
	login: boolean;
}

interface LoginResult extends GqlMutationResult<User, LoginVariables> {
	login: MutationMethod<User, LoginVariables>;
}

export default function useLogin(callback?: () => void): LoginResult {
	const client = useApolloClient();
	const result = useGQLMutation<User, LoginData, LoginVariables>(LOGIN_QUERY, null, {
		update: {
			query: LOGIN_QUERY,
			variablesUsed: null,
			update: () => {
				client.resetStore();
				return {
					login: false,
				};
			},
		},
		onCompleted: callback,
	});
	return {
		...result,
		login: result.mutate,
	};
}
