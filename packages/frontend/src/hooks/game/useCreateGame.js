import useCurrentWorld from "../world/useCurrentWorld";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../../../../common/src/gql-fragments";
import { useGQLMutation } from "../useGQLMutation";

export const CREATE_GAME = gql`
	${ACCESS_CONTROL_LIST}
	mutation createGame($worldId: ID!, $password: String, $characterName: String){
		createGame(worldId: $worldId, password: $password, characterName: $characterName){
			_id
			...accessControlList
		}
	}
`;
export default (callback) => {
	const { currentWorld } = useCurrentWorld();

	const result = useGQLMutation(CREATE_GAME, {}, { onCompleted: callback });
	const createGame = result.createGame;
	result.createGame = async (params) => {
		await createGame({ worldId: currentWorld._id, ...params });
	};
	return result;
};
