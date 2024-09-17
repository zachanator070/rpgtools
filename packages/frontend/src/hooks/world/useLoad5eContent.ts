import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {LOAD_5E_CONTENT} from "@rpgtools/common/src/gql-mutations.js";

interface Load5eContentVariables {
	worldId: string;
}

interface Load5eContentResult extends GqlMutationResult<World,  Load5eContentVariables>{
	load5eContent: MutationMethod<World, Load5eContentVariables>;
}

export default function useLoad5eContent(): Load5eContentResult {
	const result = useGQLMutation<World, Load5eContentVariables>(LOAD_5E_CONTENT);
	return {
		...result,
		load5eContent: result.mutate
	};
};
