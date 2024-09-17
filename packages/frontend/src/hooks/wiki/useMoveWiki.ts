import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {WikiPage} from "../../types.js";
import useCurrentWiki from "./useCurrentWiki.js";
import {GET_FOLDER_PATH, WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries.js";
import {MOVE_WIKI} from "@rpgtools/common/src/gql-mutations.js";

interface MoveWikiVariables {
	wikiId: string;
	folderId: string;
}

interface MoveWikiResult {
	moveWiki: MutationMethod<WikiPage, MoveWikiVariables>;
}

export default function useMoveWiki(): MoveWikiResult {
	const {currentWiki} = useCurrentWiki();
	const result = useGQLMutation<WikiPage, MoveWikiVariables>(MOVE_WIKI, null, {
		async update(cache, { data} , {variables}) {
			const newWiki = (data as any).moveWiki;
			// update old folder
			cache.updateQuery(
				{query: WIKIS_IN_FOLDER, variables: {folderId: currentWiki.folder._id}},
				(oldData) => ({
					...oldData,
					wikisInFolder: {
						...oldData.wikisInFolder,
						docs: [...oldData.wikisInFolder.docs].filter((wikiPage: WikiPage) => wikiPage._id !== newWiki._id)
					}
				})
			);

			//update new folder
			cache.updateQuery(
				{query: WIKIS_IN_FOLDER, variables: {folderId: variables.folderId}},
				(oldData = {wikisInFolder: {docs: []}}) => ({
					...oldData,
					wikisInFolder: {
						...oldData.wikisInFolder,
						docs: [...oldData.wikisInFolder.docs, newWiki].sort((a: WikiPage, b: WikiPage) => a.name < b.name ? -1 : 1)
					}
				})
			);

		},
		refetchQueries: [GET_FOLDER_PATH]
	});
	return {
		...result,
		moveWiki: result.mutate
	};
};
