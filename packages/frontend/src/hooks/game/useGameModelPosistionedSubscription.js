import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MODEL } from "@rpgtools/common/src/gql-fragments";

export const GAME_MODEL_POSITIONED_SUBSCRIPTION = gql`
	subscription gameModelPositioned($gameId: ID!){
		gameModelPositioned(gameId: $gameId){
			${GAME_MODEL}
		}
	} 
`;
export const useGameModelPositionedSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_MODEL_POSITIONED_SUBSCRIPTION, {
		gameId: game_id,
	});
};
