import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries.js";
import {DELETE_WIKI} from "@rpgtools/common/src/gql-mutations.js";

interface DeleteWikiVariables {
	wikiId: string;
}

interface DeleteWikiResult {
	deleteWiki: MutationMethod<World, DeleteWikiVariables>
}

export default function useDeleteWiki(): DeleteWikiResult {
	const result = useGQLMutation<World, DeleteWikiVariables>(DELETE_WIKI, {}, {refetchQueries: [WIKIS_IN_FOLDER]});
	return {
		...result,
		deleteWiki: result.mutate
	};
};
