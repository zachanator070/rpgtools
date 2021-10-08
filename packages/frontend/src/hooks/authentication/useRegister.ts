import gql from "graphql-tag";
import {User} from "../../types";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";

export const REGISTER_MUTATION = gql`
	mutation register(
		$registerCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		register(
			registerCode: $registerCode
			email: $email
			username: $username
			password: $password
		) {
			_id
		}
	}
`;

interface RegisterVariables {
	registerCode: string;
	email: string;
	username: string;
	password: string;
}

interface RegisterResult extends GqlMutationResult<User, RegisterVariables> {
	register: MutationMethod<User, RegisterVariables>
}

export default (callback): RegisterResult => {

	const result = useGQLMutation<User, RegisterVariables>(REGISTER_MUTATION, {}, {onCompleted: callback});
	return {
		...result,
		register: result.mutate
	};
};
