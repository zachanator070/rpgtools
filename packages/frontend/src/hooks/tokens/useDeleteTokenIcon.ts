import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {DELETE_TOKEN_ICON} from "@rpgtools/common/src/gql-mutations";
import { GET_TOKEN_ICONS } from "@rpgtools/common/src/gql-queries";

interface TokenIcon {
	_id: string;
}

interface DeleteTokenIconVariables {
	tokenIconId: string;
}

interface DeleteTokenIconResult extends GqlMutationResult<TokenIcon, DeleteTokenIconVariables> {
	deleteTokenIcon: MutationMethod<TokenIcon, DeleteTokenIconVariables>;
}

export default function useDeleteTokenIcon(callback?): DeleteTokenIconResult {
	const result = useGQLMutation<TokenIcon, DeleteTokenIconVariables>(
		DELETE_TOKEN_ICON,
		{},
		{ 
			onCompleted: async (data) => {
				if (callback) {
					await callback(data);
				}
			},
			refetchQueries: [GET_TOKEN_ICONS]
		}
	);

	return {
		...result,
		deleteTokenIcon: result.mutate
	};
}
