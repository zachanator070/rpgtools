import {GAME_MODEL_DELETED_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameModelDeletedSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MODEL_DELETED_SUBSCRIPTION, {gameId: game_id});
};