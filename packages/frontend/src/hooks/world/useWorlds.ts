import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";

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
export default (variables) => {
	return useGQLQuery(GET_WORLDS, variables);
};
