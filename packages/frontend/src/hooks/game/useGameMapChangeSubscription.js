import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_FOG_STROKES, GAME_MAP, GAME_STROKES } from "../../../../common/src/gql-fragments";

export const GAME_MAP_SUBSCRIPTION = gql`
	subscription gameMapChange($gameId: ID!,){
		gameMapChange(gameId: $gameId){
			_id
			${GAME_MAP}
			${GAME_STROKES}
			${GAME_FOG_STROKES}
		}
	}
`;
export const useGameMapChangeSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_MAP_SUBSCRIPTION, { gameId: game_id });
};
