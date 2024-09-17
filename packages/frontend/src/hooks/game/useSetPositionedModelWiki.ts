import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {SET_POSITIONED_MODEL_WIKI} from "@rpgtools/common/src/gql-mutations.js";
import {useParams} from "react-router-dom";

interface SetPositionedModelWikiVariables {
	gameId?: string;
	positionedModelId: string;
	wikiId: string;
}

interface SetPositionedModelResult extends GqlMutationResult<Game, SetPositionedModelWikiVariables>{
	setPositionedModelWiki: MutationMethod<Game, SetPositionedModelWikiVariables>;
}

export default function useSetPositionedModelWiki(): SetPositionedModelResult {
	const {game_id} = useParams();
	const returnValues = useGQLMutation<Game, SetPositionedModelWikiVariables>(SET_POSITIONED_MODEL_WIKI, {gameId: game_id});
	return {
		...returnValues,
		setPositionedModelWiki: returnValues.mutate
	};
};
