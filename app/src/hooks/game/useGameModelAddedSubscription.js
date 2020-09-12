import {GAME_MODEL_ADDED_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameModelAddedSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MODEL_ADDED_SUBSCRIPTION, {gameId: game_id});
};