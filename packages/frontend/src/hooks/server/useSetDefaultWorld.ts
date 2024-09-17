import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {ServerConfig} from "../../types.js";
import {SET_DEFAULT_WORLD} from "@rpgtools/common/src/gql-mutations.js";

interface SetDefaultWorldVariables {
    worldId: string;
}

interface SetDefaultWorldResult extends GqlMutationResult<ServerConfig, SetDefaultWorldVariables>{
    setDefaultWorld: MutationMethod<ServerConfig, SetDefaultWorldVariables>
}

export default function useSetDefaultWorld(): SetDefaultWorldResult {
    const result = useGQLMutation<ServerConfig, SetDefaultWorldVariables>(SET_DEFAULT_WORLD);
    return {
        ...result,
        setDefaultWorld: result.mutate
    };
};