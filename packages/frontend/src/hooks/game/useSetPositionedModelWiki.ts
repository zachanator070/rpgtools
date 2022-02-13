import gql from "graphql-tag";
import { GAME_MODEL } from "../gql-fragments";
import useCurrentGame from "./useCurrentGame";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";

const SET_POSITIONED_MODEL_WIKI = gql`
	${GAME_MODEL}
	mutation setPositionedModelWiki($gameId: ID!, $positionedModelId: ID!, $wikiId: ID){
		setPositionedModelWiki(gameId: $gameId, positionedModelId: $positionedModelId, wikiId: $wikiId){
			...gameModel
		}
	}
`;

interface SetPositionedModelWikiVariables {
	gameId?: string;
	positionedModelId: string;
	wikiId: string;
}

interface SetPositionedModelResult extends GqlMutationResult<Game, SetPositionedModelWikiVariables>{
	setPositionedModelWiki: MutationMethod<Game, SetPositionedModelWikiVariables>;
}

export const useSetPositionedModelWiki = (): SetPositionedModelResult => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, SetPositionedModelWikiVariables>(SET_POSITIONED_MODEL_WIKI, {gameId: currentGame._id});
	return {
		...returnValues,
		setPositionedModelWiki: returnValues.mutate
	};
};
