import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {CREATE_WIKI} from "@rpgtools/common/src/gql-mutations";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";

interface CreateWikiVariables {
	name: string;
	folderId: string;
}

interface CreateWikiResult {
	createWiki: MutationMethod<World, CreateWikiVariables>;
}

export default function useCreateWiki(): CreateWikiResult {
	const result = useGQLMutation<World, CreateWikiVariables>(CREATE_WIKI, {}, {refetchQueries: [WIKIS_IN_FOLDER]});
	return {
		...result,
		createWiki: result.mutate
	};
};
