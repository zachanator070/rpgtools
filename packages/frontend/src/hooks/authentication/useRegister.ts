import {User} from "../../types";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {REGISTER_MUTATION} from "@rpgtools/common/src/gql-mutations";

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
