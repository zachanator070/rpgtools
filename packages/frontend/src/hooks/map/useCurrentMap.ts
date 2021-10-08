import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {GqlMutationResult} from "../useGQLMutation";
import {WikiPage} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const GET_CURRENT_MAP = gql`
	query getWiki($wikiId: ID!) {
		wiki(wikiId: $wikiId) {
			_id
			type
			name
			content
			... on PermissionControlled {
				canWrite
				canAdmin
			}
			... on Place {
				mapImage {
					_id
					name
					width
					height
					chunkWidth
					chunkHeight
					chunks {
						_id
						fileId
						width
						height
						x
						y
					}
				}
			}
		}
	}
`;

interface CurrentMapVariables {
	wikiId: string;
}

interface CurrentMapResult extends GqlQueryResult<WikiPage, CurrentMapVariables>{
	wiki: WikiPage
}

export default (): CurrentMapResult => {
	const { map_id } = useParams();
	const result = useGQLQuery<WikiPage, CurrentMapVariables>(GET_CURRENT_MAP, {wikiId: map_id});
	return {
		...result,
		wiki: result.data
	}
};
