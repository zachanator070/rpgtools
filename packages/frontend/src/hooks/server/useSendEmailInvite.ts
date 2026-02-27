import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Invite } from "../../types";
import { SEND_EMAIL_INVITE } from "@rpgtools/common/src/gql-mutations";

interface SendEmailInviteVariables {
	email: string;
}

interface SendEmailInviteResult extends GqlMutationResult<Invite, SendEmailInviteVariables> {
	sendEmailInvite: MutationMethod<Invite, SendEmailInviteVariables>;
}

export default function useSendEmailInvite(): SendEmailInviteResult {
	const result = useGQLMutation<Invite, SendEmailInviteVariables>(SEND_EMAIL_INVITE);
	return {
		...result,
		sendEmailInvite: result.mutate,
	};
}
