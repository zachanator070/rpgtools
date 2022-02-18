import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {WIKIS_IN_FOLDER} from "./useWikisInFolder";

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
	const result = useGQLMutation<World, DeleteWikiVariables>(DELETE_WIKI, {refetchQueries: [WIKIS_IN_FOLDER]});
	return {
		...result,
		deleteWiki: result.mutate
	};
};
