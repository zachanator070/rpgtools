import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";
import {WorldPaginatedResult} from "../../types";

export const GET_WORLDS = gql`
	query worlds($page: Int) {
		worlds(page: $page) {
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
	page: number;
}

interface WorldsResult {
	worlds: WorldPaginatedResult;
}

export default (variables): WorldsResult => {
	const result = useGQLQuery<WorldPaginatedResult, WorldsVariables>(GET_WORLDS, variables);
	return {
		...result,
		worlds: result.data
	};
};
