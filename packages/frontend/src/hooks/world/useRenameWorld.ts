import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {RENAME_WORLD} from "@rpgtools/common/src/gql-mutations";

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