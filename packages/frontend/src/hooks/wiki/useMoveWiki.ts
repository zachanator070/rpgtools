import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {WikiPage} from "../../types";
import {WIKIS_IN_FOLDER, WIKIS_IN_FOLDER_ATTRIBUTES} from "./useWikisInFolder";
import useCurrentWiki from "./useCurrentWiki";
import {CURRENT_WORLD_WIKIS} from "../gql-fragments";
import {GET_FOLDER_PATH, useGetFolderPath} from "./useGetFolderPath";
import {useCurrentWikiId} from "./useCurrentWikiId";

export const MOVE_WIKI = gql`
	${CURRENT_WORLD_WIKIS}
	mutation moveWiki($wikiId: ID!, $folderId: ID!) {
		moveWiki(wikiId: $wikiId, folderId: $folderId) {
			${WIKIS_IN_FOLDER_ATTRIBUTES}
		}
	}
`;

interface MoveWikiVariables {
	wikiId: string;
	folderId: string;
}

interface MoveWikiResult {
	moveWiki: MutationMethod<WikiPage, MoveWikiVariables>;
}

export const useMoveWiki = (): MoveWikiResult => {
	const {currentWikiId} = useCurrentWikiId();
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
