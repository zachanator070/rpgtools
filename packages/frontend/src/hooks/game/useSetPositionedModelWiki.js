import gql from "graphql-tag";
import { GAME_MODEL } from "@rpgtools/common/src/gql-fragments";
import useCurrentGame from "./useCurrentGame";
import { useGQLMutation } from "../useGQLMutation";

const SET_POSITIONED_MODEL_WIKI = gql`
    mutation setPositionedModelWiki($gameId: ID!, $positionedModelId: ID!, $wikiId: ID){
        setPositionedModelWiki(gameId: $gameId, positionedModelId: $positionedModelId, wikiId: $wikiId){
            ${GAME_MODEL}
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
