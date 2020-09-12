import {GAME_MAP_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameMapChangeSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MAP_SUBSCRIPTION, {gameId: game_id});
};