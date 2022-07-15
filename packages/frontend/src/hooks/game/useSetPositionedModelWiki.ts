import useCurrentGame from "./useCurrentGame";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {SET_POSITIONED_MODEL_WIKI} from "@rpgtools/common/src/gql-mutations";

interface SetPositionedModelWikiVariables {
	gameId?: string;
	positionedModelId: string;
	wikiId: string;
}

interface SetPositionedModelResult extends GqlMutationResult<Game, SetPositionedModelWikiVariables>{
	setPositionedModelWiki: MutationMethod<Game, SetPositionedModelWikiVariables>;
}

export default function useSetPositionedModelWiki(): SetPositionedModelResult {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, SetPositionedModelWikiVariables>(SET_POSITIONED_MODEL_WIKI, {gameId: currentGame._id});
	return {
		...returnValues,
		setPositionedModelWiki: returnValues.mutate
	};
};
