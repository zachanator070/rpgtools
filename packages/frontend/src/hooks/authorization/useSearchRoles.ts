import gql from "graphql-tag";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import { useParams } from "react-router-dom";
import {RolePaginatedResult} from "../../types";

const SEARCH_ROLES = gql`
	query roles($worldId: ID!, $name: String, $canAdmin: Boolean) {
		roles(worldId: $worldId, name: $name, canAdmin: $canAdmin) {
			docs {
				_id
				name
			}
		}
	}
`;

interface SearchRolesVariables {
	worldId: string;
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
