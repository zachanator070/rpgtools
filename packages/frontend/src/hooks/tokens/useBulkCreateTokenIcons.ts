import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {useParams} from "react-router-dom";
import {BULK_CREATE_TOKEN_ICON} from "@rpgtools/common/src/gql-mutations";
import useTokenIcons from "./useTokenIcons";
import { TokenIcon } from "../../types";

interface BulkCreateTokenIconVariables {
    worldId: string;
    zipFile: File;
}

interface BulkCreateTokenIconResult extends GqlMutationResult<TokenIcon, BulkCreateTokenIconVariables> {
    bulkCreateTokenIcon: MutationMethod<TokenIcon, BulkCreateTokenIconVariables>;
    loading: boolean;
    errors: string[];
}

export default function useBulkCreateTokenIcon(callback?): BulkCreateTokenIconResult {
    const { world_id } = useParams();
    const {refetch} = useTokenIcons();

    const result = useGQLMutation<TokenIcon, BulkCreateTokenIconVariables>(
        BULK_CREATE_TOKEN_ICON,
        { worldId: world_id },
        { 
            onCompleted: async (data) => {
                if (callback) {
                    await callback(data);
                }
                await refetch();
            }
        }
    );

    return {
        ...result,
        bulkCreateTokenIcon: result.mutate,
        loading: result.loading,
        errors: result.errors
    };
}
