import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {WikiPage} from "../../types";
import {GET_WIKI, WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";
import {UPDATE_WIKI} from "@rpgtools/common/src/gql-mutations";

interface UpdateWikiVariables {
	wikiId: string;
	name?: string;
	content?: any;
	coverImageId?: string;
	type?: string;
}

interface UpdateWikiResult {
	updateWiki: MutationMethod<WikiPage, UpdateWikiVariables>
}

export default function useUpdateWiki(): UpdateWikiResult {
	const result = useGQLMutation<WikiPage, UpdateWikiVariables>(UPDATE_WIKI, {}, {
		refetchQueries: [GET_WIKI],
		async update(cache, { data} , {variables}) {
			const newWiki = (data as any).updateWiki;
			// update name of wiki in folder tree
			cache.updateQuery(
				{query: WIKIS_IN_FOLDER, variables: {folderId: newWiki.folder._id}},
				(oldData) => ({
					...oldData,
					wikisInFolder: {
						...oldData.wikisInFolder,
						docs: [...oldData.wikisInFolder.docs].map((wikiPage: WikiPage) => {
							if(wikiPage._id == newWiki._id){
								return {
									...wikiPage,
									name: newWiki.name
								};
							}
							return wikiPage
						})
					}
				})
			);
		}
	});
	return {
		...result,
		updateWiki: result.mutate
	};
};
