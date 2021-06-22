import { useGQLQuery } from "../useGQLQuery";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";

export const MY_PERMISSIONS = gql`
	query myPermissions($worldId: ID!) {
		myPermissions(worldId: $worldId) {
			_id
			permission
			subject {
				_id
				... on World {
					name
				}
				... on WikiPage {
					name
				}
				... on WikiFolder {
					name
				}
				... on Role {
					name
				}
			}
			subjectType
		}
	}
`;
export const useMyPermissions = () => {
	const params = useParams();
	return useGQLQuery(MY_PERMISSIONS, { worldId: params.world_id });
};
