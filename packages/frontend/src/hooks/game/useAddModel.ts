import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {ADD_MODEL} from "@rpgtools/common/src/gql-mutations";

interface AddModelVariables {
	gameId: string;
	modelId: string;
	wikiId: string;
	color: string;
}

interface AddModelResult extends GqlMutationResult<Game, AddModelVariables> {
	addModel: MutationMethod<Game, AddModelVariables>;
}

export default function useAddModel(): AddModelResult {
	const result = useGQLMutation<Game, AddModelVariables>(ADD_MODEL);
	return {
		...result,
		addModel: result.mutate
	};
};
