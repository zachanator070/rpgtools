import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const MOVE_WIKI = gql`
	mutation moveWiki($wikiId: ID!, $folderId: ID!) {
		moveWiki(wikiId: $wikiId, folderId: $folderId) {
			_id
		}
	}
`;

interface MoveWikiVariables {
	wikiId: string;
	folderId: string;
}

interface MoveWikiResult {
	moveWiki: MutationMethod<World, MoveWikiVariables>;
}

export const useMoveWiki = (): MoveWikiResult => {
	const result = useGQLMutation<World, MoveWikiVariables>(MOVE_WIKI);
	return {
		...result,
		moveWiki: result.mutate
	};
};
