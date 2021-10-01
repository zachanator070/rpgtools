import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MODEL } from "../../../../common/src/gql-fragments";

export const GAME_MODEL_POSITIONED_SUBSCRIPTION = gql`
	${GAME_MODEL}
	subscription gameModelPositioned($gameId: ID!){
		gameModelPositioned(gameId: $gameId){
			...gameModel		
		}
	} 
`;
export const useGameModelPositionedSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_MODEL_POSITIONED_SUBSCRIPTION, {
		gameId: game_id,
	});
};
