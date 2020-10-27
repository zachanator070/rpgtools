import useCurrentWorld from "../world/useCurrentWorld";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "@rpgtools/common/src/gql-fragments";
import { useGQLMutation } from "../useGQLMutation";

export const CREATE_GAME = gql`
    mutation createGame($worldId: ID!, $password: String, $characterName: String){
        createGame(worldId: $worldId, password: $password, characterName: $characterName){
            _id
            ${ACCESS_CONTROL_LIST}
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
