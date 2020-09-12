import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";
import {GAME_MODEL_POSITIONED_SUBSCRIPTION} from "../../../../common/src/gql-queries";


export const useGameModelPositionedSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MODEL_POSITIONED_SUBSCRIPTION, {gameId: game_id});
};