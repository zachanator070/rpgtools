import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {LOAD_5E_CONTENT} from "@rpgtools/common/src/gql-mutations";

interface Load5eContentVariables {
	worldId: string;
	creatureCodex: boolean;
	tomeOfBeasts: boolean;
}

interface Load5eContentResult extends GqlMutationResult<World,  Load5eContentVariables>{
	load5eContent: MutationMethod<World, Load5eContentVariables>;
}

export const useLoad5eContent = (): Load5eContentResult => {
	const result = useGQLMutation<World, Load5eContentVariables>(LOAD_5E_CONTENT);
	return {
		...result,
		load5eContent: result.mutate
	};
};
