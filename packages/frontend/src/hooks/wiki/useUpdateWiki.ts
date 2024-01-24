import useGQLMutation, { MutationMethod } from "../useGQLMutation";
import { WikiPage } from "../../types";
import { GET_WIKI, WIKIS_IN_FOLDER } from "@rpgtools/common/src/gql-queries";
import { UPDATE_WIKI } from "@rpgtools/common/src/gql-mutations";
import { WikisInFolderResult, WikisInFolderVariables } from "./useWikisInFolder";
import { UploadFile } from "antd";

interface UpdateWikiVariables {
	wikiId: string;
	name?: string;
	content?: UploadFile;
	coverImageId?: string;
	type?: string;
}

interface UpdateWikiResult {
	updateWiki: MutationMethod<WikiPage, UpdateWikiVariables>;
}

export default function useUpdateWiki(): UpdateWikiResult {
	const result = useGQLMutation<
		WikiPage,
		UpdateWikiVariables,
		WikisInFolderResult,
		WikisInFolderVariables
	>(
		UPDATE_WIKI,
		{},
		{
			refetchQueries: [GET_WIKI],
			update: {
				query: WIKIS_IN_FOLDER,
				variablesUsed: (newWiki: WikiPage): WikisInFolderVariables => {
					return { folderId: newWiki.folder._id };
				},
				update: (newWiki, oldData) => {
					return {
						...oldData,
						wikisInFolder: {
							...oldData.wikisInFolder,
							docs: [...oldData.wikisInFolder.docs].map((wikiPage: WikiPage) => {
								if (wikiPage._id == newWiki._id) {
									return {
										...wikiPage,
										name: newWiki.name,
									};
								}
								return wikiPage;
							}),
						},
					};
				},
			},
		},
	);
	return {
		...result,
		updateWiki: result.mutate,
	};
}
