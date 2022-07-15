import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {ModeledWiki} from "../../types";
import {GET_WIKI} from "@rpgtools/common/src/gql-queries";
import {UPDATE_MODELED_WIKI} from "@rpgtools/common/src/gql-mutations";

interface UpdateModeledWikiVariables {
	wikiId: string;
	model: string;
	color: string;
}

interface UpdateModeledWikiResult {
	updateModeledWiki: MutationMethod<ModeledWiki, UpdateModeledWikiVariables>;
}
export default function useUpdateModeledWiki(): UpdateModeledWikiResult {
	const result = useGQLMutation<ModeledWiki, UpdateModeledWikiVariables>(UPDATE_MODELED_WIKI, null, {
		refetchQueries: [GET_WIKI]
	});
	return {
		...result,
		updateModeledWiki: result.mutate
	};
};
