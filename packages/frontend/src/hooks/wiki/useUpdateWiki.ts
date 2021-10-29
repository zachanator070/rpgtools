import { useMutation } from "@apollo/client";
import useCurrentWiki from "./useCurrentWiki";
import gql from "graphql-tag";
import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {WikiPage} from "../../types";

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
	const { currentWiki, refetch } = useCurrentWiki();
	const result = useGQLMutation<WikiPage, UpdateWikiVariables>(UPDATE_WIKI, {}, {
		onCompleted: async () => {
			await refetch({wikiId: currentWiki._id});
		}
	});
	return {
		...result,
		updateWiki: result.mutate
	};
};
