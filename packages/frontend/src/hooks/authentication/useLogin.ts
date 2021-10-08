import {FetchResult, useApolloClient} from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {User} from "../../types";
import {ApiHookResponse} from "../types";

export const LOGIN_QUERY = gql`
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			_id
		}
	}
`;

interface LoginVariables {
	username: string;
	password: string;
}

interface LoginResult extends GqlMutationResult<User, LoginVariables> {
	login: MutationMethod<User, LoginVariables>
}

export default (callback): LoginResult => {
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
