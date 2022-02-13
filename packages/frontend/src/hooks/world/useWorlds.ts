import gql from "graphql-tag";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {UserPaginatedResult, WorldPaginatedResult} from "../../types";
import {GqlLazyHookResult} from "../useGQLLazyQuery";

export const GET_WORLDS = gql`
	query worlds($name: String, $page: Int) {
		worlds(name: $name, page: $page) {
			docs {
				_id
				name
				wikiPage {
					_id
					type
				}
			}
			totalPages
		}
	}
`;

interface WorldsVariables {
	name?: string;
	page?: number;
}

interface WorldsResult extends GqlQueryResult<WorldPaginatedResult, WorldsVariables>{
	worlds: WorldPaginatedResult;
}

export default (variables): WorldsResult => {
	const result = useGQLQuery<WorldPaginatedResult, WorldsVariables>(GET_WORLDS, variables);
	return {
		...result,
		worlds: result.data
	};
};
