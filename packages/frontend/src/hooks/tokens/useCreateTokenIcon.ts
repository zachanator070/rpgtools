import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {useParams} from "react-router-dom";
import {CREATE_TOKEN_ICON} from "@rpgtools/common/src/gql-mutations";
import useTokenIcons from "./useTokenIcons";
import { TokenIcon } from "../../types";

interface CreateTokenIconVariables {
	worldId: string;
	imageId: string;
	name?: string;
}

interface CreateTokenIconResult extends GqlMutationResult<TokenIcon, CreateTokenIconVariables> {
	createTokenIcon: MutationMethod<TokenIcon, CreateTokenIconVariables>;
	loading: boolean;
	errors: string[];
}

export default function useCreateTokenIcon(callback?): CreateTokenIconResult {
	const { world_id } = useParams();
	const {refetch} = useTokenIcons();

	const result = useGQLMutation<TokenIcon, CreateTokenIconVariables>(
		CREATE_TOKEN_ICON,
		{ worldId: world_id },
		{ 
			onCompleted: async (data) => {
				if (callback) {
					await callback(data);
				}
				await refetch();
			}
		}
	);

	return {
		...result,
		createTokenIcon: result.mutate,
		loading: result.loading,
		errors: result.errors
	};
}
