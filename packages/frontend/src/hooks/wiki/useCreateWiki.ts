import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const CREATE_WIKI = gql`
	${CURRENT_WORLD_FOLDERS}
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			...currentWorldFolders
		}
	}
`;

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
