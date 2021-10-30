import { useMutation } from "@apollo/client";
import useCurrentUser from "../authentication/useCurrentUser";
import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const SET_CURRENT_WORLD = gql`
	mutation setCurrentWorld($worldId: ID!) {
		setCurrentWorld(worldId: $worldId) {
			_id
		}
	}
`;

interface SetCurrentWorldVariables {
	worldId: string;
}

interface SetCurrentWorldResult {
	setCurrentWorld: MutationMethod<World, SetCurrentWorldVariables>;
}

export const useSetCurrentWorld = (): SetCurrentWorldResult => {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, SetCurrentWorldVariables>(SET_CURRENT_WORLD, {}, {
		onCompleted: async () => {
			await refetch();
		}
	});
	return {
		...result,
		setCurrentWorld: result.mutate
	};
};
