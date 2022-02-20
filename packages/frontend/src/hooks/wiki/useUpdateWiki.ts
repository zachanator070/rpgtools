import {GET_CURRENT_WIKI} from "./useCurrentWiki";
import gql from "graphql-tag";
import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {WikiPage} from "../../types";
import {WIKIS_IN_FOLDER } from "./useWikisInFolder";

export const UPDATE_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	mutation updateWiki($wikiId: ID!, $name: String, $content: Upload, $coverImageId: ID, $type: String){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId, type: $type){
			...currentWikiAttributes
		}
	}
`;

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

export default (): UpdateWikiResult => {
	const result = useGQLMutation<WikiPage, UpdateWikiVariables>(UPDATE_WIKI, {}, {
		refetchQueries: [GET_CURRENT_WIKI],
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
