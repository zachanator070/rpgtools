import gql from 'graphql-tag';
import {useMutation} from "@apollo/react-hooks";
import useCurrentUser from "./useCurrentUser";

const SET_CURRENT_WORLD = gql`
	mutation setCurrentWorld($worldId: ID!){
		setCurrentWorld(worldId: $worldId){
			_id
		}
	}
`;

export const useSetCurrentWorld = () => {
	const [setCurrentWorld, {loading}] = useMutation(SET_CURRENT_WORLD);
	const {refetch} = useCurrentUser();
	return {
		setCurrentWorld: async (world_id) => {
			await setCurrentWorld({variables: {worldId: world_id}});
			await refetch();
		},
		loading
	}
};