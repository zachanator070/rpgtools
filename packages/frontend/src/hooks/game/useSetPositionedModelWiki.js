import gql from "graphql-tag";
import { GAME_MODEL } from "../../../../common/src/gql-fragments";
import useCurrentGame from "./useCurrentGame";
import { useGQLMutation } from "../useGQLMutation";

const SET_POSITIONED_MODEL_WIKI = gql`
	${GAME_MODEL}
	mutation setPositionedModelWiki($gameId: ID!, $positionedModelId: ID!, $wikiId: ID){
		setPositionedModelWiki(gameId: $gameId, positionedModelId: $positionedModelId, wikiId: $wikiId){
			...gameModel
		}
	}
`;

export const useSetPositionedModelWiki = () => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation(SET_POSITIONED_MODEL_WIKI);
	const setPositionedModelWiki = returnValues.setPositionedModelWiki;
	returnValues.setPositionedModelWiki = async (variables) => {
		await setPositionedModelWiki({ gameId: currentGame._id, ...variables });
	};
	return returnValues;
};
