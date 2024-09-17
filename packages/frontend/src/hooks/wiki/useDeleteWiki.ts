import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";
import {DELETE_WIKI} from "@rpgtools/common/src/gql-mutations";

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
