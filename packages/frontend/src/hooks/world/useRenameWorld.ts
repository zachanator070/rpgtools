import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const RENAME_WORLD = gql`
	mutation renameWorld($worldId: ID!, $newName: String!) {
		renameWorld(worldId: $worldId, newName: $newName) {
			_id
			name
		}
	}
`;

interface RenameWorldVariables {
	worldId: string;
	newName: string;
}

interface RenameWorldResult extends GqlMutationResult<World, RenameWorldVariables>{
	renameWorld: MutationMethod<World, RenameWorldVariables>;
}

export const useRenameWorld = (): RenameWorldResult => {
	const result = useGQLMutation<World, RenameWorldVariables>(RENAME_WORLD);
	return {
		...result,
		renameWorld: result.mutate
	};
};
