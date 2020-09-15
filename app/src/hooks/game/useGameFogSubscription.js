import {GAME_FOG_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameFogSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_FOG_SUBSCRIPTION, {gameId: game_id});
};