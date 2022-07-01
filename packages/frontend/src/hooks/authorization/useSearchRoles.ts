import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {useParams} from "react-router-dom";
import {RolePaginatedResult} from "../../types";
import {SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface SearchRolesVariables {
	worldId?: string;
	name?: string;
	canAdmin?: boolean;
}

interface SearchRolesResult extends GqlQueryResult<RolePaginatedResult, SearchRolesVariables>{
	roles: RolePaginatedResult;
}

export const useSearchRoles = (variables): SearchRolesResult => {
	const params = useParams();
	const result = useGQLQuery<RolePaginatedResult, SearchRolesVariables>(SEARCH_ROLES, { worldId: params.world_id, ...variables });
	return {
		...result,
		roles: result.data
	};
};
