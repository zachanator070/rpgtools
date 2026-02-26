import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Invite } from "../../types";
import { INVITE_USER } from "@rpgtools/common/src/gql-mutations";

interface InviteUserVariables {
	email: string;
}

interface InviteUserResult extends GqlMutationResult<Invite, InviteUserVariables> {
	inviteUser: MutationMethod<Invite, InviteUserVariables>;
}

export default function useInviteUser(): InviteUserResult {
	const result = useGQLMutation<Invite, InviteUserVariables>(INVITE_USER);
	return {
		...result,
		inviteUser: result.mutate,
	};
}
