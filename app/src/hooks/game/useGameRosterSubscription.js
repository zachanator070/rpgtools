import {GAME_ROSTER_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameRosterSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_ROSTER_SUBSCRIPTION, {gameId: game_id});
};