import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";

export const UNLOCK_SERVER = gql`
	mutation unlockServer(
		$unlockCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		unlockServer(
			unlockCode: $unlockCode
			email: $email
			username: $username
			password: $password
		)
	}
`;
interface UnlockServerVariables {
	unlockCode: string;
	email: string;
	username: string;
	password: string;
}

interface UnlockServerResult extends GqlMutationResult<boolean, UnlockServerVariables>{
	unlockServer: MutationMethod<boolean, UnlockServerVariables>
}

export default (callback?: (data: boolean) => Promise<void>): UnlockServerResult => {
	const result = useGQLMutation<boolean, UnlockServerVariables>(
		UNLOCK_SERVER,
		{},
		{
			onCompleted: callback
		}
	);

	return {
		...result,
		unlockServer: result.mutate
	};
};
