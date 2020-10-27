import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "@rpgtools/common/src/gql-fragments";

export const CREATE_WIKI = gql`
	mutation createWiki($name: String!, $folderId: ID!){
		createWiki(name: $name, folderId: $folderId){
			${CURRENT_WORLD_FOLDERS}
		}
	}
`;
export const useCreateWiki = () => {
	const [createWiki, { data, loading, error }] = useMutation(CREATE_WIKI);
	return {
		createWiki: async (name, folderId) => {
			const result = await createWiki({ variables: { name, folderId } });
			return result.data.createWiki;
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		wiki: data ? data.createWiki : null,
	};
};
