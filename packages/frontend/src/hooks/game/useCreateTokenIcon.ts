import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {useParams} from "react-router-dom";
import {CREATE_TOKEN_ICON} from "@rpgtools/common/src/gql-mutations";

interface TokenIcon {
	_id: string;
	image: {
		_id: string;
	};
	world: {
		_id: string;
	};
}

interface CreateTokenIconVariables {
	worldId: string;
	imageId: string;
}

interface CreateTokenIconResult extends GqlMutationResult<TokenIcon, CreateTokenIconVariables> {
	createTokenIcon: MutationMethod<TokenIcon, CreateTokenIconVariables>;
}

export default function useCreateTokenIcon(callback?): CreateTokenIconResult {
	const { world_id } = useParams();

	const result = useGQLMutation<TokenIcon, CreateTokenIconVariables>(
		CREATE_TOKEN_ICON,
		{ worldId: world_id },
		{ onCompleted: callback }
	);

	return {
		...result,
		createTokenIcon: result.mutate
	};
}
