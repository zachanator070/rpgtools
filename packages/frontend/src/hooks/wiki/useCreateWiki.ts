import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {WikiFolder, WikiPage, World} from "../../types.js";
import {CREATE_WIKI} from "@rpgtools/common/src/gql-mutations";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";

interface CreateWikiVariables {
	name: string;
	folderId: string;
}

interface CreateWikiResult {
	createWiki: MutationMethod<WikiFolder, CreateWikiVariables>;
}

export default function useCreateWiki(): CreateWikiResult {
	const result = useGQLMutation<WikiFolder, CreateWikiVariables>(CREATE_WIKI, {}, {
		async update(cache, { data} , {variables}) {
			const newWiki = (data as any).createWiki;
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
		}
	});
	return {
		...result,
		createWiki: result.mutate
	};
};
