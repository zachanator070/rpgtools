import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!) {
		deleteWiki(wikiId: $wikiId) {
			_id
		}
	}
`;

interface DeleteWikiVariables {
	wikiId: string;
}

interface DeleteWikiResult {
	deleteWiki: MutationMethod<World, DeleteWikiVariables>
}

export const useDeleteWiki = (): DeleteWikiResult => {
	const result = useGQLMutation<World, DeleteWikiVariables>(DELETE_WIKI);
	return {
		...result,
		deleteWiki: result.mutate
	};
};
