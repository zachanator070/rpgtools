import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";
import { useParams } from "react-router-dom";

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

export const useSearchRoles = (variables) => {
	const params = useParams();
	return useGQLQuery(SEARCH_ROLES, { worldId: params.world_id, ...variables });
};
