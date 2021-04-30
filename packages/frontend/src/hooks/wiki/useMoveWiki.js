import gql from "graphql-tag";
import { useGQLMutation } from "../useGQLMutation";

export const MOVE_WIKI = gql`
	mutation moveWiki($wikiId: ID!, $folderId: ID!) {
		moveWiki(wikiId: $wikiId, folderId: $folderId) {
			_id
		}
	}
`;

export const useMoveWiki = () => {
	return useGQLMutation(MOVE_WIKI);
};
