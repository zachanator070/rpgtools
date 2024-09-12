import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {CREATE_WORLD} from "@rpgtools/common/src/gql-mutations";

interface CreateWorldVariables {
	name: string;
	public: boolean;
}

interface CreateWorldResult extends GqlMutationResult<World,  CreateWorldVariables> {
	createWorld: MutationMethod<World, CreateWorldVariables>
}

export default function useCreateWorld(callback): CreateWorldResult {
	const result = useGQLMutation<World, CreateWorldVariables>(CREATE_WORLD, {}, {onCompleted: callback});
	return {
		...result,
		createWorld: result.mutate
	};
};
