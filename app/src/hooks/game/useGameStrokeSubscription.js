import {GAME_STROKE_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameStrokeSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_STROKE_SUBSCRIPTION, {gameId: game_id});
};