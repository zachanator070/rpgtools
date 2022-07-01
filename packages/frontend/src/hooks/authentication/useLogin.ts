import {useApolloClient} from "@apollo/client";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {User} from "../../types";
import {LOGIN_QUERY} from "@rpgtools/common/src/gql-mutations";

interface LoginVariables {
	username: string;
	password: string;
}

interface LoginResult extends GqlMutationResult<User, LoginVariables> {
	login: MutationMethod<User, LoginVariables>
}

export default (callback?): LoginResult => {
	const client = useApolloClient();
	const result = useGQLMutation<User, LoginVariables>(LOGIN_QUERY, null, {
		async update(cache, { data }) {
			await client.resetStore();
		},
		onCompleted: callback,
	});
	return {
		...result,
		login: result.mutate
	}
};
