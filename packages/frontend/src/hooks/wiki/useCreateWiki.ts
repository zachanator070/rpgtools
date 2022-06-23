import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {CREATE_WIKI} from "@rpgtools/common/src/gql-mutations";

interface CreateWikiVariables {
	name: string;
	folderId: string;
}

interface CreateWikiResult {
	createWiki: MutationMethod<World, CreateWikiVariables>;
}

export const useCreateWiki = (): CreateWikiResult => {
	const result = useGQLMutation<World, CreateWikiVariables>(CREATE_WIKI);
	return {
		...result,
		createWiki: result.mutate
	};
};
